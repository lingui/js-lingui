import { makeConfig } from "@lingui/conf"
import { getPathsForExtractWatcher } from "./getPathsForExtractWatcher.js"
import fs from "fs"
import os from "os"
import { glob } from "node:fs/promises"
import path from "path"
import micromatch from "micromatch"
import normalizePath from "normalize-path"

describe("getPathsForExtractWatcher", () => {
  it("should generate correct paths for simple catalogs", async () => {
    const config = makeConfig(
      {
        rootDir: import.meta.dirname,
        locales: ["en", "pl"],
        catalogs: [
          {
            path: "src/locales/{locale}/messages",
            include: ["<rootDir>/src", "/components/**"],
            exclude: ["node_modules"],
          },
        ],
      },
      { skipValidation: true },
    )

    const res = await getPathsForExtractWatcher(config)

    expect(res.ignored).toStrictEqual(["src/locales/", "node_modules/"])
    expect(res.paths).toStrictEqual([
      normalizePath(path.join(import.meta.dirname, "src")),
      "/components/**",
    ])
  })

  it.each(["componentA", "[slug]", "[...params]", "[[...params]]"])(
    "should match the named catalog directory %s",
    async (name) => {
      const fixtureRoot = fs.mkdtempSync(
        path.join(os.tmpdir(), "lingui-extract-watcher-"),
      )
      const previousCwd = process.cwd()

      try {
        const routeDir = path.join(fixtureRoot, "src", "pages", name)
        fs.mkdirSync(path.join(routeDir, "ignored"), { recursive: true })
        fs.writeFileSync(path.join(routeDir, "index.tsx"), "export {}")
        fs.writeFileSync(
          path.join(routeDir, "ignored", "index.tsx"),
          "export {}",
        )
        process.chdir(fixtureRoot)

        const config = makeConfig(
          {
            rootDir: fixtureRoot,
            locales: ["en"],
            catalogs: [
              {
                path: "src/locales/{name}/{locale}/messages",
                include: ["src/pages/{name}"],
                exclude: ["src/pages/{name}/ignored/**"],
              },
            ],
          },
          { skipValidation: true },
        )

        const { paths, ignored } = await getPathsForExtractWatcher(config)
        const matches: string[] = []
        for await (const match of glob(paths)) {
          matches.push(normalizePath(match))
        }

        expect(matches).toEqual([
          normalizePath(path.join("src", "pages", name)),
        ])
        expect(
          micromatch.any(
            normalizePath(
              path.join("src", "pages", name, "ignored", "index.tsx"),
            ),
            ignored,
          ),
        ).toBe(true)
      } finally {
        process.chdir(previousCwd)
        fs.rmSync(fixtureRoot, { recursive: true, force: true })
      }
    },
  )
})

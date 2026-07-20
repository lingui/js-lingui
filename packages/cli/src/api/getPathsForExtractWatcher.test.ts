import { makeConfig } from "@lingui/conf"
import { getPathsForExtractWatcher } from "./getPathsForExtractWatcher.js"
import { glob } from "node:fs/promises"
import path from "path"
import micromatch from "micromatch"
import normalizePath from "normalize-path"
import { createFixtures } from "../tests.js"

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
      const rootDir = await createFixtures({
        [`/src/pages/${name}/index.tsx`]: "export {}",
        [`/src/pages/${name}/ignored/index.tsx`]: "export {}",
      })

      const config = makeConfig(
        {
          rootDir,
          locales: ["en"],
          catalogs: [
            {
              path: "<rootDir>/src/locales/{name}/{locale}/messages",
              include: ["<rootDir>/src/pages/{name}"],
              exclude: ["<rootDir>/src/pages/{name}/ignored/**"],
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
        normalizePath(path.join(rootDir, "src", "pages", name)),
      ])
      expect(
        micromatch.any(
          normalizePath(
            path.join(rootDir, "src", "pages", name, "ignored", "index.tsx"),
          ),
          ignored,
        ),
      ).toBe(true)
    },
  )
})

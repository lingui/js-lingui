import { makeConfig } from "@lingui/conf"
import { getPathForCompileWatcher } from "./getPathForCompileWatcher.js"
import { createFixtures } from "../tests.js"
import path from "path"

describe("getPathsForCompileWatcher", () => {
  it("should generate correct paths for simple catalogs", async () => {
    const config = makeConfig(
      {
        locales: ["en", "pl"],
        catalogs: [
          {
            path: "src/locales/{locale}/messages",
            include: ["src"],
          },
          {
            path: "src/locales/{locale}/components",
            include: ["components"],
          },
          {
            path: "src/catalogs/{locale}",
            include: ["src"],
          },
        ],
      },
      { skipValidation: true },
    )

    const res = await getPathForCompileWatcher(config)

    expect(res).toMatchInlineSnapshot(`
      {
        paths: [
          src/locales/en/messages.po,
          src/locales/en/components.po,
          src/catalogs/en.po,
          src/locales/pl/messages.po,
          src/locales/pl/components.po,
          src/catalogs/pl.po,
        ],
      }
    `)
  })

  it("should generate correct paths for catalogs with {name} expansion", async () => {
    const outputDir = await createFixtures({
      "componentA/index.js": "content",
      "componentB/index.js": "content",
    })

    const config = makeConfig(
      {
        rootDir: outputDir,
        locales: ["en", "pl"],
        catalogs: [
          {
            path: "<rootDir>/{name}/locales/{locale}",
            include: ["<rootDir>/{name}/"],
          },
        ],
      },
      { skipValidation: true },
    )

    const res = await getPathForCompileWatcher(config)

    expect(res.paths.sort()).toStrictEqual(
      [
        path.join(outputDir, "componentA/locales/en.po"),
        path.join(outputDir, "componentB/locales/en.po"),
        path.join(outputDir, "componentA/locales/pl.po"),
        path.join(outputDir, "componentB/locales/pl.po"),
      ].sort(),
    )
  })
})

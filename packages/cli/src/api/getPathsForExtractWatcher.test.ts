import { makeConfig } from "@lingui/conf"
import { getPathsForExtractWatcher } from "./getPathsForExtractWatcher.js"

describe("getPathsForExtractWatcher", () => {
  it("should generate correct paths for simple catalogs", async () => {
    const config = makeConfig(
      {
        locales: ["en", "pl"],
        catalogs: [
          {
            path: "src/locales/{locale}/messages",
            include: ["src", "/components/**"],
            exclude: ["node_modules"],
          },
        ],
      },
      { skipValidation: true },
    )

    const res = await getPathsForExtractWatcher(config)

    expect(res).toMatchInlineSnapshot(`
      {
        ignored: [
          src/locales/,
          node_modules/,
        ],
        paths: [
          src/,
          /components/**,
        ],
      }
    `)
  })
})

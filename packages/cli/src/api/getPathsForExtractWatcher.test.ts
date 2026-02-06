import { makeConfig } from "@lingui/conf"
import { getPathsForExtractWatcher } from "./getPathsForExtractWatcher.js"
import path from "path"

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
      path.join(import.meta.dirname, "src"),
      "/components/**",
    ])
  })
})

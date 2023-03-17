import { printStats } from "./stats"
import { defaultMergeOptions, makeCatalog, makeNextMessage } from "../tests"
import { makeConfig } from "@lingui/conf"
import { AllCatalogsType } from "./types"

describe("PrintStats", () => {
  it("should print correct stats for a basic setup", async () => {
    const config = makeConfig({
      locales: ["en", "cs"],
    })

    const prevCatalogs: AllCatalogsType = { en: null, cs: null }
    const nextCatalog = {
      "custom.id": makeNextMessage({
        message: "Message with custom ID",
      }),
      "Message with <0>auto-generated</0> ID": makeNextMessage(),
    }

    const catalogs = (await makeCatalog({ sourceLocale: "en" })).merge(
      prevCatalogs,
      nextCatalog,
      defaultMergeOptions
    )

    const { options, ...table } = printStats(config, catalogs)
    expect(options.head).toEqual(["Language", "Total count", "Missing"])
    expect(Object.values(table)).toStrictEqual([
      { en: [2, 0] },
      { cs: [2, 2] },
      2,
    ])
  })
})

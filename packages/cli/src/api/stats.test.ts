import { printStats } from "./stats.js"
import { defaultMergeOptions, makeCatalog, makeNextMessage } from "../tests.js"
import { makeConfig } from "@lingui/conf"
import { AllCatalogsType } from "./types.js"
import { expect } from "vitest"

describe("PrintStats", () => {
  it("should print correct stats for a basic setup", async () => {
    const config = makeConfig({
      locales: ["en", "cs", "pseudo"],
      sourceLocale: "en",
      pseudoLocale: "pseudo",
    })

    const prevCatalogs: AllCatalogsType = { en: {}, cs: {}, pseudo: {} }
    const nextCatalog = {
      "custom.id": makeNextMessage({
        message: "Message with custom ID",
      }),
      "Message with <0>auto-generated</0> ID": makeNextMessage(),
    }

    const catalogs = (await makeCatalog(config)).merge(
      prevCatalogs,
      nextCatalog,
      defaultMergeOptions,
    )

    const table = printStats(config, catalogs)

    expect(table.toString()).toMatchInlineSnapshot(`
      ┌─────────────┬─────────────┬─────────┐
      │ Language    │ Total count │ Missing │
      ├─────────────┼─────────────┼─────────┤
      │ en (source) │      2      │    -    │
      │ cs          │      2      │    2    │
      └─────────────┴─────────────┴─────────┘
    `)
  })

  it("should print correct stats for a setup with multiple pseudolocales", async () => {
    const config = makeConfig({
      locales: ["en", "cs", "pseudo-en", "pseudo-ar"],
      sourceLocale: "en",
      pseudoLocale: [
        { locale: "pseudo-en", prepend: "⟦ ", append: " ⟧" },
        { locale: "pseudo-ar", rightToLeft: true },
      ],
    })

    const prevCatalogs: AllCatalogsType = {
      en: {},
      cs: {},
      "pseudo-en": {},
      "pseudo-ar": {},
    }
    const nextCatalog = {
      "custom.id": makeNextMessage({
        message: "Message with custom ID",
      }),
      "Message with <0>auto-generated</0> ID": makeNextMessage(),
    }

    const catalogs = (await makeCatalog(config)).merge(
      prevCatalogs,
      nextCatalog,
      defaultMergeOptions,
    )

    const table = printStats(config, catalogs)

    expect(table.toString()).toMatchInlineSnapshot(`
      ┌─────────────┬─────────────┬─────────┐
      │ Language    │ Total count │ Missing │
      ├─────────────┼─────────────┼─────────┤
      │ en (source) │      2      │    -    │
      │ cs          │      2      │    2    │
      └─────────────┴─────────────┴─────────┘
    `)
  })
})

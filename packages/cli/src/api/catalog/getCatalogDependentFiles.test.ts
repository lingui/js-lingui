import { getCatalogDependentFiles, getFormat } from "@lingui/cli/api"
import { makeConfig } from "@lingui/conf"
import { Catalog } from "../catalog"
import { FormatterWrapper } from "../formats"

describe("getCatalogDependentFiles", () => {
  let format: FormatterWrapper

  beforeAll(async () => {
    format = await getFormat("po", {}, "en")
  })

  it("Should return list template + fallbacks + sourceLocale", () => {
    const config = makeConfig(
      {
        locales: ["en", "pl", "es", "pt-PT", "pt-BR"],
        sourceLocale: "en",
        fallbackLocales: {
          "pt-PT": "pt-BR",
          default: "en",
        },
      },
      { skipValidation: true }
    )

    const catalog = new Catalog(
      {
        name: null,
        path: "src/locales/{locale}",
        include: ["src/"],
        exclude: [],
        format,
      },
      config
    )

    expect(getCatalogDependentFiles(catalog, "pt-PT")).toMatchInlineSnapshot(`
      [
        src/locales/messages.pot,
        src/locales/pt-BR.po,
        src/locales/en.po,
      ]
    `)
  })

  it("Should not return itself", () => {
    const config = makeConfig(
      {
        locales: ["en", "pl", "es", "pt-PT", "pt-BR"],
        sourceLocale: "en",
        fallbackLocales: {
          "pt-PT": "pt-BR",
          default: "en",
        },
      },
      { skipValidation: true }
    )

    const catalog = new Catalog(
      {
        name: null,
        path: "src/locales/{locale}",
        include: ["src/"],
        exclude: [],
        format,
      },
      config
    )

    expect(getCatalogDependentFiles(catalog, "en")).toMatchInlineSnapshot(`
      [
        src/locales/messages.pot,
      ]
    `)
  })
})

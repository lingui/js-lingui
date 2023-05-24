import { getCatalogDependentFiles, getFormat } from "@lingui/cli/api"
import { makeConfig } from "@lingui/conf"
import { Catalog } from "../catalog"
import { FormatterWrapper } from "../formats"
import mockFs from "mock-fs"

describe("getCatalogDependentFiles", () => {
  let format: FormatterWrapper

  beforeAll(async () => {
    format = await getFormat("po", {}, "en")
  })
  afterEach(() => {
    mockFs.restore()
  })

  it("Should return list template + fallbacks + sourceLocale", async () => {
    mockFs({
      "/src/locales": {
        "messages.pot": "bla",
        "en.po": "bla",
        "pl.po": "bla",
        "es.po": "bla",
        "pt-PT.po": "bla",
        "pt-BR.po": "bla",
      },
    })

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
        path: "/src/locales/{locale}",
        include: ["src/"],
        exclude: [],
        format,
      },
      config
    )

    console.log(catalog.path)
    const actual = await getCatalogDependentFiles(catalog, "pt-PT")
    mockFs.restore()

    expect(actual).toMatchInlineSnapshot(`
      [
        /src/locales/messages.pot,
        /src/locales/pt-BR.po,
        /src/locales/en.po,
      ]
    `)
  })

  it("Should not return itself", async () => {
    mockFs({
      "/src/locales": {
        "messages.pot": "bla",
        "en.po": "bla",
        "pl.po": "bla",
        "es.po": "bla",
        "pt-PT.po": "bla",
        "pt-BR.po": "bla",
      },
    })

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
        path: "/src/locales/{locale}",
        include: ["src/"],
        exclude: [],
        format,
      },
      config
    )

    const actual = await getCatalogDependentFiles(catalog, "en")
    mockFs.restore()

    expect(actual).toMatchInlineSnapshot(`
      [
        /src/locales/messages.pot,
      ]
    `)
  })

  it("Should not return non-existing files", async () => {
    mockFs({
      "/src/locales": {
        // "messages.pot": "bla",
        "en.po": "bla",
        "pl.po": "bla",
        "es.po": "bla",
        "pt-PT.po": "bla",
        "pt-BR.po": "bla",
      },
    })

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
        path: "/src/locales/{locale}",
        include: ["src/"],
        exclude: [],
        format,
      },
      config
    )

    const actual = await getCatalogDependentFiles(catalog, "pt-PT")
    mockFs.restore()

    expect(actual).toMatchInlineSnapshot(`
      [
        /src/locales/pt-BR.po,
        /src/locales/en.po,
      ]
    `)
  })
})

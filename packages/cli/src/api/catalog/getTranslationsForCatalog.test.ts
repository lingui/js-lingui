import { getTranslationsForCatalog } from "./getTranslationsForCatalog"
import { Catalog } from "../catalog"
import type { AllCatalogsType, CatalogType } from "../types"

function getCatalogStub(
  catalogs: AllCatalogsType,
  template: CatalogType = {}
): Catalog {
  const catalogStub: Partial<Catalog> = {
    async readAll(): Promise<AllCatalogsType> {
      return catalogs
    },

    async readTemplate(): Promise<CatalogType> {
      return template
    },
  }

  return catalogStub as Catalog
}

function lang(
  locale: string,
  messages: Array<(locale: string) => CatalogType>
) {
  return {
    [locale]: messages.reduce((acc, msgFn) => {
      return {
        ...acc,
        ...msgFn(locale),
      }
    }, {}),
  }
}

function message(id: string, source: string, noTranslation = false) {
  return (locale: string): CatalogType => ({
    [id]: {
      message: source,
      translation: noTranslation ? null : `${locale}: translation: ${source}`,
    },
  })
}

describe("getTranslationsForCatalog", () => {
  it("Should return translated catalog if all translation exists", async () => {
    // prettier-ignore
    const catalogStub = getCatalogStub({
      ...lang("pl", [
        message("hashid1", "Lorem")
      ])
    })

    const actual = await getTranslationsForCatalog(catalogStub, "pl", {
      sourceLocale: "en",
      fallbackLocales: {},
    })

    expect(actual).toMatchInlineSnapshot(`
      {
        messages: {
          hashid1: pl: translation: Lorem,
        },
        missing: [],
      }
    `)
  })

  it("Should fallback to fallbackLocales.default", async () => {
    // prettier-ignore
    const catalogStub = getCatalogStub({
      ...lang("pl", [
        message("hashid1", "Lorem"),
        message("hashid2", "Ipsum")
      ]),
      ...lang("ru", [
        message("hashid1", "Lorem"),
        message("hashid2", "Ipsum", true)
      ])
    })

    const actual = await getTranslationsForCatalog(catalogStub, "ru", {
      sourceLocale: "en",
      fallbackLocales: {
        default: "pl",
      },
    })

    expect(actual).toMatchInlineSnapshot(`
      {
        messages: {
          hashid1: ru: translation: Lorem,
          hashid2: pl: translation: Ipsum,
        },
        missing: [],
      }
    `)
  })

  it("Should fallback to single fallbackLocales", async () => {
    // prettier-ignore
    const catalogStub = getCatalogStub({
      ...lang("pl", [
        message("hashid1", "Lorem"),
        message("hashid2", "Ipsum")
      ]),
      ...lang("ru", [
        message("hashid1", "Lorem"),
        message("hashid2", "Ipsum", true)
      ])
    })

    const actual = await getTranslationsForCatalog(catalogStub, "ru", {
      sourceLocale: "en",
      fallbackLocales: {
        ru: "pl",
      },
    })

    expect(actual).toMatchInlineSnapshot(`
      {
        messages: {
          hashid1: ru: translation: Lorem,
          hashid2: pl: translation: Ipsum,
        },
        missing: [],
      }
    `)
  })

  it("Should fallback to multiple fallbacks and then to default", async () => {
    // prettier-ignore
    const catalogStub = getCatalogStub({
      ...lang("pl", [
        message("hashid1", "Lorem"),
        message("hashid2", "Ipsum"),
        message("hashid3", "Dolor")
      ]),
      ...lang("es", [
        message("hashid1", "Lorem"),
        message("hashid2", "Ipsum"),
        message("hashid3", "Dolor", true),
        message("hashid4", "Sit")
      ]),
      ...lang("de", [
        message("hashid1", "Lorem"),
        message("hashid2", "Ipsum", true),
        message("hashid3", "Dolor", true)
      ]),
      ...lang("ru", [
        message("hashid1", "Lorem"),
        message("hashid2", "Ipsum", true),
        message("hashid3", "Dolor", true),

        // this is not present in first fallback locale DE, but present in next ES
        message("hashid4", "Sit", true)
      ])
    })

    const actual = await getTranslationsForCatalog(catalogStub, "ru", {
      sourceLocale: "en",
      fallbackLocales: {
        ru: ["de", "es"],
        default: "pl",
      },
    })

    expect(actual).toStrictEqual({
      messages: {
        hashid1: "ru: translation: Lorem",
        // this fallback to de -> es
        hashid2: "es: translation: Ipsum",
        // this fallback to de -> es -> default
        hashid3: "pl: translation: Dolor",
        // this fallback to de -> es
        hashid4: "es: translation: Sit",
      },
      missing: [],
    })
  })

  it(
    "Should fallback to source messages and don't call onMissing" +
      " when target locale == sourceLocale",
    async () => {
      // prettier-ignore
      const catalogStub = getCatalogStub({
      ...lang("en", [
        message("hashid1", "Lorem", true),
        message("hashid2", "Ipsum")
      ])
    })

      const actual = await getTranslationsForCatalog(catalogStub, "en", {
        sourceLocale: "en",
        fallbackLocales: {},
      })

      expect(actual).toMatchInlineSnapshot(`
        {
          messages: {
            hashid1: Lorem,
            hashid2: en: translation: Ipsum,
          },
          missing: [],
        }
      `)
    }
  )

  it("Should fallback to source locale if no other fallbacks and report missing", async () => {
    // prettier-ignore
    const catalogStub = getCatalogStub({
      ...lang("en", [
        message("hashid1", "Lorem", true)
      ]),

      ...lang("pl", [
        message("hashid1", "", true)
      ])
    })

    const actual = await getTranslationsForCatalog(catalogStub, "pl", {
      sourceLocale: "en",
      fallbackLocales: {},
    })

    expect(actual).toMatchInlineSnapshot(`
      {
        messages: {
          hashid1: Lorem,
        },
        missing: [
          {
            id: hashid1,
            source: Lorem,
          },
        ],
      }
    `)
  })

  it("Should add keys from source locale", async () => {
    // prettier-ignore
    const catalogStub = getCatalogStub({
      ...lang("en", [
        message("hashid1", "Lorem", true),
        message("hashid2", "Ipsum", true),
        message("hashid3", "Dolor", true),
        message("hashid4", "Sit", true)
      ]),
      ...lang("pl", [
        message("hashid1", "Lorem"),
        message("hashid2", "Ipsum")
      ])
    })

    const actual = await getTranslationsForCatalog(catalogStub, "pl", {
      sourceLocale: "en",
      fallbackLocales: {},
    })

    expect(actual).toMatchInlineSnapshot(`
      {
        messages: {
          hashid1: pl: translation: Lorem,
          hashid2: pl: translation: Ipsum,
          hashid3: Dolor,
          hashid4: Sit,
        },
        missing: [
          {
            id: hashid3,
            source: Dolor,
          },
          {
            id: hashid4,
            source: Sit,
          },
        ],
      }
    `)
  })

  it("Should not fail if sourceLocale is not set", async () => {
    // prettier-ignore
    const catalogStub = getCatalogStub({
      ...lang("en", [
        message("hashid1", "Lorem", true),
        message("hashid2", "Ipsum", true),
        message("hashid3", "Dolor", true),
        message("hashid4", "Sit", true)
      ]),
      ...lang("pl", [
        message("hashid1", "Lorem"),
        message("hashid2", "Ipsum")
      ])
    })

    const actual = await getTranslationsForCatalog(catalogStub, "pl", {
      sourceLocale: null,
      fallbackLocales: {},
    })

    expect(actual).toMatchInlineSnapshot(`
      {
        messages: {
          hashid1: pl: translation: Lorem,
          hashid2: pl: translation: Ipsum,
        },
        missing: [],
      }
    `)
  })

  it("Should add keys from template", async () => {
    // prettier-ignore
    const catalogStub = getCatalogStub({
      ...lang("pl", [
        message("hashid1", "Lorem"),
        message("hashid2", "Ipsum")
      ])
    }, lang("tpl", [
      message("hashid1", "Lorem", true),
      message("hashid2", "Ipsum", true),
      message("hashid3", "Dolor", true),
      message("hashid4", "Sit", true)
    ]).tpl)

    const actual = await getTranslationsForCatalog(catalogStub, "pl", {
      sourceLocale: "en",
      fallbackLocales: {},
    })

    expect(actual).toMatchInlineSnapshot(`
      {
        messages: {
          hashid1: pl: translation: Lorem,
          hashid2: pl: translation: Ipsum,
          hashid3: Dolor,
          hashid4: Sit,
        },
        missing: [
          {
            id: hashid3,
            source: Dolor,
          },
          {
            id: hashid4,
            source: Sit,
          },
        ],
      }
    `)
  })

  it("Should not fail if catalog for requested locale does not exists", async () => {
    // prettier-ignore
    const catalogStub = getCatalogStub({}, lang("tpl", [
      message("hashid1", "Lorem", true),
    ]).tpl)

    const actual = await getTranslationsForCatalog(catalogStub, "pl", {
      sourceLocale: "en",
      fallbackLocales: {},
    })

    expect(actual).toMatchInlineSnapshot(`
      {
        messages: {
          hashid1: Lorem,
        },
        missing: [
          {
            id: hashid1,
            source: Lorem,
          },
        ],
      }
    `)
  })
})

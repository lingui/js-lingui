import { getTranslationsForCatalog } from "./getTranslationsForCatalog"
import { Catalog } from "../catalog"
import type { AllCatalogsType, CatalogType } from "../types"

function getCatalogStub(
  catalogs: AllCatalogsType,
  template: CatalogType = {}
): Catalog {
  const catalogStub: Partial<Catalog> = {
    readAll(): AllCatalogsType {
      return catalogs
    },

    readTemplate(): CatalogType {
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
  it("Should return translated catalog if all translation exists", () => {
    // prettier-ignore
    const catalogStub = getCatalogStub({
      ...lang("pl", [
        message("hashid1", "Lorem")
      ])
    })

    const missingSpy = jest.fn()
    const actual = getTranslationsForCatalog(catalogStub, "pl", {
      sourceLocale: "en",
      fallbackLocales: {},
      onMissing: missingSpy,
    })

    expect(missingSpy).not.toBeCalled()
    expect(actual).toStrictEqual({
      hashid1: "pl: translation: Lorem",
    })
  })

  it("Should fallback to fallbackLocales.default", () => {
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

    const missingSpy = jest.fn()
    const actual = getTranslationsForCatalog(catalogStub, "ru", {
      sourceLocale: "en",
      fallbackLocales: {
        default: "pl",
      },
      onMissing: missingSpy,
    })

    expect(missingSpy).not.toBeCalled()

    expect(actual).toStrictEqual({
      hashid1: "ru: translation: Lorem",
      hashid2: "pl: translation: Ipsum",
    })
  })

  it("Should fallback to single fallbackLocales", () => {
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

    const missingSpy = jest.fn()
    const actual = getTranslationsForCatalog(catalogStub, "ru", {
      sourceLocale: "en",
      fallbackLocales: {
        ru: "pl",
      },
      onMissing: missingSpy,
    })

    expect(missingSpy).not.toBeCalled()

    expect(actual).toStrictEqual({
      hashid1: "ru: translation: Lorem",
      hashid2: "pl: translation: Ipsum",
    })
  })

  it("Should fallback to multiple fallbacks and then to default", () => {
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

    const missingSpy = jest.fn()
    const actual = getTranslationsForCatalog(catalogStub, "ru", {
      sourceLocale: "en",
      fallbackLocales: {
        ru: ["de", "es"],
        default: "pl",
      },
      onMissing: missingSpy,
    })

    expect(missingSpy).not.toBeCalled()
    expect(actual).toStrictEqual({
      hashid1: "ru: translation: Lorem",
      // this fallback to de -> es
      hashid2: "es: translation: Ipsum",
      // this fallback to de -> es -> default

      hashid3: "pl: translation: Dolor",
      // this fallback to de -> es
      hashid4: "es: translation: Sit",
    })
  })

  it(
    "Should fallback to source messages and don't call onMissing" +
      " when target locale == sourceLocale",
    () => {
      // prettier-ignore
      const catalogStub = getCatalogStub({
      ...lang("en", [
        message("hashid1", "Lorem", true),
        message("hashid2", "Ipsum")
      ])
    })

      const missingSpy = jest.fn()
      const actual = getTranslationsForCatalog(catalogStub, "en", {
        sourceLocale: "en",
        fallbackLocales: {},
        onMissing: missingSpy,
      })

      expect(missingSpy).not.toBeCalled()
      expect(actual).toStrictEqual({
        hashid1: "Lorem",
        hashid2: "en: translation: Ipsum",
      })
    }
  )

  it("Should fallback to source locale if no other fallbacks and report missing", () => {
    // prettier-ignore
    const catalogStub = getCatalogStub({
      ...lang("en", [
        message("hashid1", "Lorem", true)
      ]),

      ...lang("pl", [
        message("hashid1", "", true)
      ])
    })

    const missingSpy = jest.fn()
    const actual = getTranslationsForCatalog(catalogStub, "pl", {
      sourceLocale: "en",
      fallbackLocales: {},
      onMissing: missingSpy,
    })

    expect(missingSpy).toBeCalledWith({
      id: "hashid1",
      source: "Lorem",
    })
    expect(actual).toStrictEqual({
      hashid1: "Lorem",
    })
  })

  it("Should add keys from source locale", () => {
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

    const missingSpy = jest.fn()
    const actual = getTranslationsForCatalog(catalogStub, "pl", {
      sourceLocale: "en",
      fallbackLocales: {},
      onMissing: missingSpy,
    })

    expect(actual).toStrictEqual({
      hashid1: "pl: translation: Lorem",
      hashid2: "pl: translation: Ipsum",
      hashid3: "Dolor",
      hashid4: "Sit",
    })
    expect(missingSpy).toBeCalledTimes(2)
  })

  it("Should not fail if sourceLocale is not set", () => {
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

    const missingSpy = jest.fn()
    const actual = getTranslationsForCatalog(catalogStub, "pl", {
      sourceLocale: null,
      fallbackLocales: {},
      onMissing: missingSpy,
    })

    expect(actual).toStrictEqual({
      hashid1: "pl: translation: Lorem",
      hashid2: "pl: translation: Ipsum",
    })
    expect(missingSpy).toBeCalledTimes(0)
  })

  it("Should add keys from template", () => {
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

    const missingSpy = jest.fn()
    const actual = getTranslationsForCatalog(catalogStub, "pl", {
      sourceLocale: "en",
      fallbackLocales: {},
      onMissing: missingSpy,
    })

    expect(actual).toStrictEqual({
      hashid1: "pl: translation: Lorem",
      hashid2: "pl: translation: Ipsum",
      hashid3: "Dolor",
      hashid4: "Sit",
    })
    expect(missingSpy).toBeCalledTimes(2)
  })

  it("Should not fail if catalog for requested locale does not exists", () => {
    // prettier-ignore
    const catalogStub = getCatalogStub({}, lang("tpl", [
      message("hashid1", "Lorem", true),
    ]).tpl)

    const missingSpy = jest.fn()
    const actual = getTranslationsForCatalog(catalogStub, "pl", {
      sourceLocale: "en",
      fallbackLocales: {},
      onMissing: missingSpy,
    })

    expect(actual).toStrictEqual({
      hashid1: "Lorem",
    })
    expect(missingSpy).toBeCalledTimes(1)
  })
})

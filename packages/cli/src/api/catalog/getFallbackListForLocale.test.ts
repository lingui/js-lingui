import { getFallbackListForLocale } from "./getFallbackListForLocale"

describe("getFallbackListForLocale", () => {
  it("Should return normalized fallback locales for passed locale", () => {
    const actual = getFallbackListForLocale(
      {
        "pt-PT": "pt-BR",
        default: "en",
      },
      "pt-PT"
    )

    expect(actual).toMatchInlineSnapshot(`
      [
        pt-BR,
        en,
      ]
    `)
  })

  it("Should work with list of fallbacks", () => {
    const actual = getFallbackListForLocale(
      {
        "pt-PT": ["pt-BR", "pt"],
        default: "en",
      },
      "pt-PT"
    )

    expect(actual).toMatchInlineSnapshot(`
      [
        pt-BR,
        pt,
        en,
      ]
    `)
  })

  it("Should work when no fallback set", () => {
    const actual = getFallbackListForLocale(
      {
        default: "en",
      },
      "pt-PT"
    )

    expect(actual).toMatchInlineSnapshot(`
      [
        en,
      ]
    `)
  })

  it("Should not return itself", () => {
    const actual = getFallbackListForLocale(
      {
        default: "en",
      },
      "en"
    )

    expect(actual).toMatchInlineSnapshot(`[]`)
  })
})

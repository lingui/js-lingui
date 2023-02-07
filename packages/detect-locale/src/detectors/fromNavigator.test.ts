import { fromNavigator } from ".."

describe("fromNavigator", () => {
  it("parses correctly navigator.language", () => {
    const mock: Partial<Navigator> = {
      language: "en_EN",
    }
    const locale = fromNavigator(mock)
    expect(locale).toEqual("en_EN")
  })

  it("on IE_11 navigator.language doesnt exist, goes to the fallback", () => {
    const mock: Partial<Navigator & { userLanguage?: string }> = {
      userLanguage: "es_ES",
    }
    const locale = fromNavigator(mock)
    expect(locale).toEqual("es_ES")
  })
})

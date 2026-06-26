import { getPseudoLocale, getPseudoLocaleOptions } from "./getPseudoLocale"

describe("getPseudoLocale", () => {
  it("returns an empty string when unset", () => {
    expect(getPseudoLocale(undefined)).toBe("")
    expect(getPseudoLocale("")).toBe("")
  })

  it("returns the locale from the string form", () => {
    expect(getPseudoLocale("pseudo")).toBe("pseudo")
  })

  it("returns the locale from the object form", () => {
    expect(getPseudoLocale({ locale: "pseudo", prepend: "⟦ " })).toBe("pseudo")
  })
})

describe("getPseudoLocaleOptions", () => {
  it("returns an empty object for the string and unset forms", () => {
    expect(getPseudoLocaleOptions(undefined)).toEqual({})
    expect(getPseudoLocaleOptions("pseudo")).toEqual({})
  })

  it("returns the options without the locale from the object form", () => {
    expect(
      getPseudoLocaleOptions({
        locale: "pseudo",
        prepend: "⟦ ",
        append: " ⟧",
        extend: 0.4,
      }),
    ).toEqual({ prepend: "⟦ ", append: " ⟧", extend: 0.4 })
  })
})

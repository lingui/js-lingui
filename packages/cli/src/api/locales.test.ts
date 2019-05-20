import * as locales from "./locales"

describe("Catalog formats utilities - locales", function() {
  it("isValid - should validate locale format", function() {
    expect(locales.isValid("en")).toBeTruthy()
    expect(locales.isValid("en_US")).toBeTruthy()
    expect(locales.isValid("en-US")).toBeTruthy()
    expect(locales.isValid("zh-Hans-TW")).toBeTruthy()
    expect(locales.isValid("xyz")).toBeFalsy()
  })

  it("parse - should parse language and country from locale", function() {
    expect(locales.parse("en")).toEqual({ locale: "en", language: "en" })
    expect(locales.parse("en_US")).toEqual({ locale: "en-US", language: "en" })
    expect(locales.parse("en-US")).toEqual({ locale: "en-US", language: "en" })
  })
})

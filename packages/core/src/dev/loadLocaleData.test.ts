import loadLocaleData from "./loadLocaleData"

jest.mock("make-plural/plurals")

import * as plurals from 'make-plural/plurals';

describe("loadLocaleData", () => {
  it("should return null if locale not passed", () => {
    expect(loadLocaleData(null)).toEqual(undefined)
  })

  it("should return a plural fn", () => {
    const result = loadLocaleData("es_CA")
    expect(result).toEqual({ plurals: plurals["es"] })
    result.plurals()
    expect(plurals["es"]).toHaveBeenCalled()
  })
})

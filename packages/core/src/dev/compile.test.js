import compile from "./compile"
import { mockEnv } from "../mocks"
import { interpolate } from "../context"

describe("compile", function() {
  const englishPlurals = {
    plurals(value, ordinal) {
      if (ordinal) {
        return { "1": "one", "2": "two", "3": "few" }[value] || "other"
      } else {
        return value === 1 ? "one" : "other"
      }
    }
  }

  const prepare = (translation, language, locales) =>
    interpolate(compile(translation), language || "en", locales, englishPlurals)

  it("should compile static message", function() {
    const cache = compile("Static message")
    expect(cache).toEqual("Static message")

    mockEnv("production", () => {
      const cache = compile("Static message")
      expect(cache).toEqual("Static message")
    })
  })

  it("should compile message with variable", function() {
    const cache = compile("Hey {name}!")
    expect(interpolate(cache)({ name: "Joe" })).toEqual("Hey Joe!")
  })

  it("should compile plurals", function() {
    const plural = prepare(
      "{value, plural, one {{value} Book} other {# Books}}"
    )
    expect(plural({ value: 1 })).toEqual("1 Book")
    expect(plural({ value: 2 })).toEqual("2 Books")

    const offset = prepare(
      "{value, plural, offset:1 =0 {No Books} one {# Book} other {# Books}}"
    )
    expect(offset({ value: 0 })).toEqual("No Books")
    expect(offset({ value: 2 })).toEqual("1 Book")
    expect(offset({ value: 3 })).toEqual("2 Books")
  })

  it("should compile selectordinal", function() {
    const cache = prepare(
      "{value, selectordinal, one {1st Book} two {2nd Book}}"
    )
    expect(cache({ value: 1 })).toEqual("1st Book")
    expect(cache({ value: 2 })).toEqual("2nd Book")
  })

  it("should compile select", function() {
    const cache = prepare("{value, select, female {She} other {They}}")
    expect(cache({ value: "female" })).toEqual("She")
    expect(cache({ value: "n/a" })).toEqual("They")
  })

  const testVector = [
    ["en", null, "0.1", "10%", "20%", "3/4/2017", "€0.10", "€1.00"],
    ["fr", null, "0,1", "10 %", "20 %", "04/03/2017", "0,10 €", "1,00 €"],
    ["fr", "fr-CH", "0,1", "10%", "20%", "04.03.2017", "0.10 €", "1.00 €"]
  ]
  testVector.forEach(tc => {
    const [
      language,
      locales,
      expectedNumber,
      expectedPercent1,
      expectedPercent2,
      expectedDate,
      expectedCurrency1,
      expectedCurrency2
    ] = tc

    it(
      "should compile custom format for language=" +
        language +
        " and locales=" +
        locales,
      function() {
        const number = prepare("{value, number}", language, locales)
        expect(number({ value: 0.1 })).toEqual(expectedNumber)

        const percent = prepare("{value, number, percent}", language, locales)
        expect(percent({ value: 0.1 })).toEqual(expectedPercent1)
        expect(percent({ value: 0.2 })).toEqual(expectedPercent2)

        const now = new Date("3/4/2017")
        const date = prepare("{value, date}", language, locales)
        expect(date({ value: now })).toEqual(expectedDate)

        const formats = {
          currency: {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 2
          }
        }
        const currency = prepare("{value, number, currency}", language, locales)
        expect(currency({ value: 0.1 }, formats)).toEqual(expectedCurrency1)
        expect(currency({ value: 1 }, formats)).toEqual(expectedCurrency2)
      }
    )
  })
})

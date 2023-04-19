import { compileMessage as compile } from "@lingui/message-utils/compileMessage"
import { mockEnv, mockConsole } from "@lingui/jest-mocks"
import { interpolate } from "./interpolate"
import { Locale, Locales } from "./i18n"

describe("interpolate", () => {
  const prepare = (translation: string, locale?: Locale, locales?: Locales) => {
    const tokens = compile(translation)
    return interpolate(tokens, locale || "en", locales)
  }

  it("should handle an error if message has syntax errors", () => {
    mockConsole((console) => {
      expect(compile("Invalid {message")).toEqual("Invalid {message")
      expect(console.error).toBeCalledWith(
        expect.stringMatching("Unexpected message end at line")
      )
    })
  })

  it("should process string chunks with provided map fn", () => {
    const tokens = compile(
      "Message {value, plural, one {{value} Book} other {# Books}}",
      (text) => `<${text}>`
    )
    expect(tokens).toEqual([
      "<Message >",
      [
        "value",
        "plural",
        {
          one: [["value"], "< Book>"],
          other: ["#", "< Books>"],
        },
      ],
    ])
  })

  it("should compile static message", () => {
    const cache = compile("Static message")
    expect(cache).toEqual("Static message")

    mockEnv("production", () => {
      const cache = compile("Static message")
      expect(cache).toEqual("Static message")
    })
  })

  it("should compile message with variable", () => {
    const cache = compile("Hey {name}!")
    expect(interpolate(cache, "en", [])({ name: "Joe" })).toEqual("Hey Joe!")
  })

  it("should not interpolate escaped placeholder", () => {
    const msg = prepare("Hey '{name}'!")

    expect(msg({})).toEqual("Hey {name}!")
  })

  it("should compile plurals", () => {
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

  it("when a value is defined (even when empty) plural will return it. Conversely, if a value is not defined, plural defaults to 'other'", () => {
    const plural = prepare("{value, plural, =0 {} other {#% discount}}")
    expect(plural({ value: 0 })).toEqual("")
    expect(plural({ value: 1 })).toEqual("1% discount")
    expect(plural({ value: 30 })).toEqual("30% discount")
  })

  it("does not use message for positive value 'one' when negative value (-1) is provided", () => {
    const plural = prepare("{value, plural, one {one item} other {some items}}")
    expect(plural({ value: 1 })).toEqual("one item")
    // should not pass!
    expect(plural({ value: -1 })).toEqual("one item")
  })

  it("should compile selectordinal", () => {
    const cache = prepare(
      "{value, selectordinal, one {#st Book} two {#nd Book}}"
    )
    expect(cache({ value: 1 })).toEqual("1st Book")
    expect(cache({ value: 2 })).toEqual("2nd Book")
  })

  it("should support nested choice components", () => {
    const cache = prepare(
      `{
      gender, select,
      male {{numOfGuests, plural, one {He invites one guest} other {He invites # guests}}}
      female {{numOfGuests, plural, one {She invites one guest} other {She invites # guests}}}
      other {They is {gender}}}`
    )

    expect(cache({ numOfGuests: 1, gender: "male" })).toEqual(
      "He invites one guest"
    )
    expect(cache({ numOfGuests: 3, gender: "male" })).toEqual(
      "He invites 3 guests"
    )
    expect(cache({ numOfGuests: 1, gender: "female" })).toEqual(
      "She invites one guest"
    )
    expect(cache({ numOfGuests: 3, gender: "female" })).toEqual(
      "She invites 3 guests"
    )
    expect(cache({ numOfGuests: 3, gender: "unknown" })).toEqual(
      "They is unknown"
    )
  })

  it("should compile select", () => {
    const cache = prepare("{value, select, female {She} other {They}}")
    expect(cache({ value: "female" })).toEqual("She")
    expect(cache({ value: "n/a" })).toEqual("They")
  })

  describe("Custom format", () => {
    const testVector = [
      ["en", null, "0.1", "10%", "20%", "3/4/2017", "€0.10", "€1.00"],
      ["fr", null, "0,1", "10 %", "20 %", "04/03/2017", "0,10 €", "1,00 €"],
      ["fr", "fr-CH", "0,1", "10%", "20%", "04.03.2017", "0.10 €", "1.00 €"],
    ]
    testVector.forEach((tc) => {
      const [
        locale,
        locales,
        expectedNumber,
        expectedPercent1,
        expectedPercent2,
        expectedDate,
        expectedCurrency1,
        expectedCurrency2,
      ] = tc

      it(`should compile custom format for locale=${locale} and locales=${locales}`, () => {
        const number = prepare("{value, number}", locale, locales)
        expect(number({ value: 0.1 })).toEqual(expectedNumber)

        const percent = prepare("{value, number, percent}", locale, locales)
        expect(percent({ value: 0.1 })).toEqual(expectedPercent1)
        expect(percent({ value: 0.2 })).toEqual(expectedPercent2)

        const now = new Date("3/4/2017")
        const date = prepare("{value, date}", locale, locales)
        expect(date({ value: now })).toEqual(expectedDate)

        const formats = {
          currency: {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 2,
          } satisfies Intl.NumberFormatOptions,
        }
        const currency = prepare("{value, number, currency}", locale, locales)
        expect(currency({ value: 0.1 }, formats)).toEqual(expectedCurrency1)
        expect(currency({ value: 1 }, formats)).toEqual(expectedCurrency2)
      })
    })
  })
})

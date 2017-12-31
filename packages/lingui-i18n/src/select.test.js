/* @flow */
import { plural, select, selectOrdinal } from "./select"
import { setupI18n } from "lingui-i18n"

describe("plural", function() {
  const i18n = setupI18n({
    language: "en",
    catalogs: {
      en: {
        messages: {}
      }
    }
  })

  it("should convert to message format string", function() {
    const p = plural(i18n)
    expect(
      p({
        value: 1,
        one: "# book",
        other: "# books"
      })
    ).toEqual("1 book")

    expect(
      p({
        value: 42,
        one: "# book",
        other: "# books"
      })
    ).toEqual("42 books")

    expect(
      p({
        value: 1,
        offset: 1,
        "1": "Their book",
        one: "Their and one another book",
        other: "Their and # books"
      })
    ).toEqual("Their book")

    expect(
      p({
        value: 5,
        offset: 1,
        "1": "Their book",
        one: "Their and one another book",
        other: "Their and # books"
      })
    ).toEqual("Their and 4 books")
  })
})

describe("selectOrdinal", function() {
  const i18n = setupI18n({
    language: "en",
    catalogs: {
      en: {
        messages: {}
      }
    }
  })

  it("should convert to message format string", function() {
    const s = selectOrdinal(i18n)
    expect(
      s({
        value: 1,
        one: "#st",
        two: "#nd",
        other: "##rd"
      })
    ).toEqual("1st")

    expect(
      s({
        value: 2,
        one: "#st",
        two: "#nd",
        other: "##rd"
      })
    ).toEqual("2nd")

    expect(
      s({
        value: 3,
        one: "#st",
        two: "#nd",
        other: "#rd"
      })
    ).toEqual("3rd")

    expect(
      s({
        value: 1,
        offset: 1,
        "1": "One",
        one: "#st",
        two: "#nd",
        other: "#rd"
      })
    ).toEqual("One")
  })

  it("should use other rule when ordinal ones are missing", function() {
    const i18nCS = setupI18n({
      language: "cs",
      catalogs: {
        cs: {
          messages: {}
        }
      }
    })

    const s = selectOrdinal(i18nCS)
    expect(
      s({
        value: 1,
        other: "#. křižovatka"
      })
    ).toEqual("1. křižovatka")
  })
})

describe("select", function() {
  it("should select option based on value", function() {
    expect(
      select({
        value: "male",
        male: "He",
        female: "She",
        other: "They"
      })
    ).toEqual("He")

    expect(
      select({
        value: "unknown",
        male: "He",
        female: "She",
        other: "They"
      })
    ).toEqual("They")
  })
})

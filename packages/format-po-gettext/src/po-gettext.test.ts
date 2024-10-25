import { mockConsole } from "@lingui/jest-mocks"
import fs from "fs"
import path from "path"

import { CatalogFormatter, CatalogType } from "@lingui/conf"
import { formatter as createFormat } from "./po-gettext"
import MockDate from "mockdate"

const defaultParseCtx: Parameters<CatalogFormatter["parse"]>[1] = {
  locale: "en",
  sourceLocale: "en",
  filename: "file.po",
}

const defaultSerializeCtx: Parameters<CatalogFormatter["serialize"]>[1] = {
  locale: "en",
  existing: null,
  filename: "file.po",
  sourceLocale: "en",
}

describe("po-gettext format", () => {
  const format = createFormat()

  beforeAll(() => {
    MockDate.set(new Date("2018-08-27T10:00Z"))
  })

  afterAll(() => {
    MockDate.reset()
  })

  it("should convert ICU plural messages to gettext plurals", () => {
    const catalog: CatalogType = {
      static: {
        translation: "Static message",
      },
      message_with_id_and_octothorpe: {
        message: "{count, plural, one {Singular} other {Number is #}}",
        translation: "{count, plural, one {Singular} other {Number is #}}",
        comments: ["js-lingui-explicit-id"],
      },
      message_with_id: {
        message:
          "{someCount, plural, one {Singular case with id\
          and linebreak} other {Case number {someCount} with id}}",
        translation:
          "{someCount, plural, one {Singular case with id} other {Case number {someCount} with id}}",
        comments: [
          "This is a comment by the developers about how the content must be localized.",
          "js-lingui-explicit-id",
        ],
      },
      WGI12K: {
        message:
          "{anotherCount, plural, one {Singular case} other {Case number {anotherCount}}}",
        translation:
          "{anotherCount, plural, one {Singular case} other {Case number {anotherCount}}}",
      },
      // Entry with developer-defined ID that generates empty msgstr[] lines
      message_with_id_but_without_translation: {
        message:
          "{count, plural, one {Singular with id but no translation} other {Plural {count} with empty id but no translation}}",
        translation: "",
        comments: ["js-lingui-explicit-id"],
      },
      // Entry with automatic ID that generates empty msgstr[] lines
      xZCXAV: {
        message:
          "{count, plural, one {Singular automatic id no translation} other {Plural {count} automatic id no translation}}",
        translation: "",
      },
    }

    const pofile = format.serialize(catalog, defaultSerializeCtx)

    expect(pofile).toMatchSnapshot()
  })

  it("should convert gettext plurals to ICU plural messages", () => {
    const pofile = fs
      .readFileSync(path.join(__dirname, "fixtures/messages_plural.po"))
      .toString()

    const catalog = format.parse(pofile, defaultParseCtx)

    expect(catalog).toMatchSnapshot()
  })

  it("should warn when using nested plurals that cannot be represented with gettext plurals", () => {
    const catalog = {
      nested_plural_message: {
        message: `{count, plural,
          one {{numArticles, plural,
            one {1 book and 1 article}
            other {1 book and {numArticles} articles}
          }}
          other {{numArticles, plural,
            one {{numBooks} books and 1 article}
            other {{numBooks} books and {numArticles} articles}
          }}
        }`,
        translation: `{count, plural,
          one {{numArticles, plural,
            one {1 book and 1 article}
            other {1 book and {numArticles} articles}
          }}
          other {{numArticles, plural,
            one {{numBooks} books and 1 article}
            other {{numBooks} books and {numArticles} articles}
          }}
        }`,
      },
    }

    mockConsole((console) => {
      format.serialize(catalog, defaultSerializeCtx)

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("Nested plurals"),
        "nested_plural_message"
      )
    })
  })

  it("should use correct ICU plural cases for languages having an additional plural case for fractions", () => {
    // This tests the edge case described in https://github.com/lingui/js-lingui/pull/677#issuecomment-737152022
    const po = `
msgid ""
msgstr ""
"Language: cs\n"

#. js-lingui:icu=%7B#%2C+plural%2C+one+%7Bday%7D+other+%7Bdays%7D%7D&pluralize_on=#
msgid "# day"
msgid_plural "# days"
msgstr[0] "# den"
msgstr[1] "# dny"
msgstr[2] "# dní"
  `

    const parsed = format.parse(po, defaultParseCtx)

    // Note that the last case must be `other` (the 4th CLDR case name) instead of `many` (the 3rd CLDR case name).
    expect(parsed).toMatchInlineSnapshot(`
      {
        Y8Xw2Y: {
          comments: [],
          context: null,
          extra: {
            flags: [],
            translatorComments: [],
          },
          message: {#, plural, one {day} other {days}},
          obsolete: false,
          origin: [],
          translation: {#, plural, one {# den} few {# dny} other {# dní}},
        },
      }
    `)
  })

  describe("when using 'select' format", () => {
    const catalog = {
      select_message: {
        message: `{gender, select, male {he} female {she} other {they}`,
        translation: "",
      },
    }

    it("should warn", () => {
      mockConsole((console) => {
        format.serialize(catalog, defaultSerializeCtx)

        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining("select"),
          "select_message"
        )
      })
    })

    it("should not warn when disabling the warning in config", () => {
      const format = createFormat({ disableSelectWarning: true })

      mockConsole((console) => {
        format.serialize(catalog, defaultSerializeCtx)

        expect(console.warn).not.toHaveBeenCalled()
      })
    })
  })

  describe("when using 'selectOrdinal' format", () => {
    const catalog = {
      select_ordinal_message: {
        message: `{count, selectOrdinal, one {#st} two {#nd} few {#rd} other {#th}}`,
        translation: "",
      },
    }

    it("should warn", () => {
      mockConsole((console) => {
        format.serialize(catalog, defaultSerializeCtx)

        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining("selectOrdinal"),
          "select_ordinal_message"
        )
      })
    })

    it("should not warn when disabling the warning in config", () => {
      const format = createFormat({ disableSelectWarning: true })

      mockConsole((console) => {
        format.serialize(catalog, defaultSerializeCtx)

        expect(console.warn).not.toHaveBeenCalled()
      })
    })
  })

  it("convertPluralsToIco handle correctly locales with 4-letter", () => {
    const pofile = fs
      .readFileSync(
        path.join(__dirname, "fixtures/messages_plural-4-letter.po")
      )
      .toString()

    const catalog = format.parse(pofile, defaultParseCtx)

    expect(catalog).toMatchSnapshot()
  })


  test("should use respect Plural-Forms header", () => {
    const po = `
msgid ""
msgstr ""
"Language: fr\\n"
"Plural-Forms: nplurals=3; plural=(n == 0 || n == 1) ? 0 : n != 0 && n % 1000000 == 0 ? 1 : 2;\\n"

#. js-lingui:icu=%7B0%2C+plural%2C+one+%7B%7Bcount%7D+day%7D+other+%7B%7Bcount%7D+days%7D%7D&pluralize_on=0
msgid "{count} day"
msgid_plural "{count} days"
msgstr[0] "{count} jour"
msgstr[1] "{count} jours"
msgstr[2] "{count} jours"
        `

    const parsed = format.parse(po, defaultParseCtx)

    // Note that the last case must be `other` (the 4th CLDR case name) instead of `many` (the 3rd CLDR case name).
    expect(parsed).toMatchInlineSnapshot(`
      {
        ZETJEQ: {
          comments: [],
          context: null,
          extra: {
            flags: [],
            translatorComments: [],
          },
          message: {0, plural, one {{count} day} other {{count} days}},
          obsolete: false,
          origin: [],
          translation: {0, plural, one {{count} jour} many {{count} jours} other {{count} jours}},
        },
      }
    `)
  })

  it("should correctly handle skipped form", () => {
    // in this test Plural-Forms header defines 4 forms via `nplurals=4`
    // but expression never returns 2 form, only [0, 1, 3]
    const po = `
msgid ""
msgstr ""
"Language: cs\n"
"Plural-Forms: nplurals=4; plural=(n==1) ? 0 : (n>=2 && n<=4) ? 1 : 3;\n"

#. js-lingui:icu=%7Bcount%2C+plural%2C+one+%7B%7Bcount%7D+day%7D+few+%7B%7Bcount%7D+days%7D+many+%7B%7Bcount%7D+days%7D+other+%7B%7Bcount%7D+days%7D%7D&pluralize_on=#
msgid "# day"
msgid_plural "# days"
msgstr[0] "# den"
msgstr[1] "# dny"
msgstr[2] "# dne"
msgstr[3] "# dní"
        `

    const parsed = format.parse(po, defaultParseCtx)

    // Note that the last case must be `other` (the 4th CLDR case name) instead of `many` (the 3rd CLDR case name).
    expect(parsed).toMatchInlineSnapshot(`
      {
        GMnlGy: {
          comments: [],
          context: null,
          extra: {
            flags: [],
            translatorComments: [],
          },
          message: {count, plural, one {{count} day} few {{count} days} many {{count} days} other {{count} days}},
          obsolete: false,
          origin: [],
          translation: {#, plural, one {# den} few {# dny}  other {# dní}},
        },
      }
    `)
  })

  describe("using custom prefix", () => {
    it("parses plurals correctly", () => {
      const defaultProfile = fs
        .readFileSync(path.join(__dirname, "fixtures/messages_plural.po"))
        .toString()
      const customProfile = defaultProfile.replace(
        /js-lingui:/g,
        "custom-prefix:"
      )

      const defaultPrefix = createFormat()
      const customPrefix = createFormat({ customICUPrefix: "custom-prefix:" })

      const defaultCatalog = defaultPrefix.parse(
        defaultProfile,
        defaultParseCtx
      )
      const customCatalog = customPrefix.parse(customProfile, defaultParseCtx)

      expect(defaultCatalog).toEqual(customCatalog)
    })

    it("warns and falls back to using count if prefix is not found", () => {
      const defaultProfile = fs
        .readFileSync(path.join(__dirname, "fixtures/messages_plural.po"))
        .toString()

      const usingInvalidPrefix = createFormat({
        customICUPrefix: "invalid-prefix:",
      })
      mockConsole((console) => {
        const catalog = usingInvalidPrefix.parse(
          defaultProfile,
          defaultParseCtx
        )
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining(
            "should be stored in a comment starting with"
          ),
          expect.anything()
        )
        expect(catalog).toMatchSnapshot()
      })
    })

    it("handles custom prefix", () => {
      const format = createFormat({ customICUPrefix: "custom-prefix:" })

      const catalog: CatalogType = {
        message_with_id: {
          message:
            "{someCount, plural, one {Singular case with id\
            and linebreak} other {Case number {someCount} with id}}",
          translation:
            "{someCount, plural, one {Singular case with id} other {Case number {someCount} with id}}",
          comments: [
            "This is a comment by the developers about how the content must be localized.",
            "js-lingui-explicit-id",
          ],
        },
        WGI12K: {
          message:
            "{anotherCount, plural, one {Singular case} other {Case number {anotherCount}}}",
          translation:
            "{anotherCount, plural, one {Singular case} other {Case number {anotherCount}}}",
        },
      }

      const pofile = format.serialize(catalog, defaultSerializeCtx)

      expect(pofile).toMatchSnapshot()
    })
  })
})

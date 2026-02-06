import { mockConsole } from "@lingui/test-utils"
import fs from "fs"
import path from "path"

import { CatalogFormatter, CatalogType } from "@lingui/conf"
import { formatter as createFormat } from "./po-gettext"
import { generateMessageId } from "@lingui/message-utils/generateMessageId"

const defaultParseCtx: Parameters<CatalogFormatter["parse"]>[1] = {
  locale: "en",
  sourceLocale: "en",
  filename: "file.po",
}

const defaultSerializeCtx: Parameters<CatalogFormatter["serialize"]>[1] = {
  locale: "en",
  existing: undefined,
  filename: "file.po",
  sourceLocale: "en",
}

describe("po-gettext format", () => {
  const format = createFormat()

  beforeAll(() => {
    vi.setSystemTime(new Date("2018-08-27T10:00Z"))
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

  it("should print source message as translation for source locale catalog for explicit id", () => {
    const catalog: CatalogType = {
      "custom.id": {
        message:
          "{count, plural, one {Singular with id but no translation} other {Plural {count} with empty id but no translation}}",
        translation: "",
      },
      WGI12K: {
        message:
          "{anotherCount, plural, one {Singular case} other {Case number {anotherCount}}}",
        translation:
          "{anotherCount, plural, one {Singular case} other {Case number {anotherCount}}}",
      },
    }

    expect(
      format.serialize(catalog, {
        ...defaultSerializeCtx,
        sourceLocale: "en",
        locale: "en",
      }),
    ).toMatchSnapshot("source locale catalog")

    expect(
      format.serialize(catalog, {
        ...defaultSerializeCtx,
        sourceLocale: "en",
        locale: undefined,
      }),
    ).toMatchSnapshot("template locale catalog")

    expect(
      format.serialize(catalog, {
        ...defaultSerializeCtx,
        sourceLocale: "en",
        locale: "pl",
      }),
    ).toMatchSnapshot("target locale catalog")
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
        "nested_plural_message",
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
        "Y8Xw2Y": {
          "comments": [],
          "context": undefined,
          "extra": {
            "flags": [],
            "translatorComments": [],
          },
          "message": "{#, plural, one {day} other {days}}",
          "obsolete": false,
          "origin": [],
          "translation": "{#, plural, one {# den} few {# dny} other {# dní}}",
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
          "select_message",
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
          "select_ordinal_message",
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
        path.join(__dirname, "fixtures/messages_plural-4-letter.po"),
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
        "ZETJEQ": {
          "comments": [],
          "context": undefined,
          "extra": {
            "flags": [],
            "translatorComments": [],
          },
          "message": "{0, plural, one {{count} day} other {{count} days}}",
          "obsolete": false,
          "origin": [],
          "translation": "{0, plural, one {{count} jour} many {{count} jours} other {{count} jours}}",
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
        "GMnlGy": {
          "comments": [],
          "context": undefined,
          "extra": {
            "flags": [],
            "translatorComments": [],
          },
          "message": "{count, plural, one {{count} day} few {{count} days} many {{count} days} other {{count} days}}",
          "obsolete": false,
          "origin": [],
          "translation": "{#, plural, one {# den} few {# dny}  other {# dní}}",
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
        "custom-prefix:",
      )

      const defaultPrefix = createFormat()
      const customPrefix = createFormat({ customICUPrefix: "custom-prefix:" })

      const defaultCatalog = defaultPrefix.parse(
        defaultProfile,
        defaultParseCtx,
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
          defaultParseCtx,
        )
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining(
            "should be stored in a comment starting with",
          ),
          expect.anything(),
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

  describe("merging plurals", () => {
    const duplicateFormatter = createFormat({ mergePlurals: true })

    const createCatalog = (messages: string[]): CatalogType => {
      const catalog: CatalogType = {}
      messages.forEach((message) => {
        const id = generateMessageId(message)
        catalog[id] = {
          message,
          translation: message,
        }
      })
      return catalog
    }

    it("should not merge when option is false", () => {
      const formatter = createFormat()
      const catalog = createCatalog([
        "{count, plural, one {one book} other {many books}}",
        "{anotherCount, plural, one {one book} other {many books}}",
        "{count, plural, one {one rock} other {# rocks}}",
        "{thirdCount, plural, one {one rock} other {# rocks}}",
      ])

      const pofile = formatter.serialize(catalog, defaultSerializeCtx) as string
      expect(pofile).toMatchSnapshot()
    })

    it("should merge duplicate plural entries with same msgid/msgid_plural but different variables", () => {
      const catalog = createCatalog([
        "{count, plural, one {one book} other {many books}}",
        "{anotherCount, plural, one {one book} other {many books}}",
        "{count, plural, one {one rock} other {# rocks}}",
        "{thirdCount, plural, one {one rock} other {# rocks}}",
      ])
      const pofile = duplicateFormatter.serialize(
        catalog,
        defaultSerializeCtx,
      ) as string

      expect(pofile).toMatchSnapshot()
    })

    it("should not add comment if there is only one entry", () => {
      const catalog = createCatalog([
        "{count, plural, one {one book} other {many books}}",
        "{count, plural, one {one rock} other {# rocks}}",
      ])

      const pofile = duplicateFormatter.serialize(
        catalog,
        defaultSerializeCtx,
      ) as string

      expect(pofile).toMatchSnapshot()
    })

    it("should add one entry even if there are multiple entries", () => {
      const catalog = createCatalog([
        "{count, plural, one {one book} other {many books}}",
        "{anotherCount, plural, one {one book} other {many books}}",
        "{thirdCount, plural, one {one book} other {many books}}",
        "{manyCount, plural, one {one book} other {many books}}",
        "{superLongVariableNameIsOkayCount, plural, one {one book} other {many books}}",
      ])
      const pofile = duplicateFormatter.serialize(
        catalog,
        defaultSerializeCtx,
      ) as string

      expect(pofile).toMatchSnapshot()
    })

    it("uses custom prefix when provided", () => {
      const duplicateFormatter = createFormat({
        mergePlurals: true,
        customICUPrefix: "customprefix:",
      })
      const catalog = createCatalog([
        "{count, plural, one {one book} other {many books}}",
        "{anotherCount, plural, one {one book} other {many books}}",
      ])
      const pofile = duplicateFormatter.serialize(
        catalog,
        defaultSerializeCtx,
      ) as string

      expect(pofile).toMatchSnapshot()
    })

    it("should preserve all source locations when merging duplicate entries", () => {
      const duplicateFormatter = createFormat({ mergePlurals: true })
      const message1 = "{count, plural, one {one book} other {many books}}"
      const message2 =
        "{anotherCount, plural, one {one book} other {many books}}"

      const id1 = generateMessageId(message1)
      const id2 = generateMessageId(message2)

      const catalog: CatalogType = {
        // Entry with origin information
        [id1]: {
          message: message1,
          translation: message1,
          origin: [["src/App.tsx", 60]],
        },
        // Another entry with same strings but different variable and different origin
        [id2]: {
          message: message2,
          translation: message2,
          origin: [["src/App.tsx", 66]],
        },
      }

      const pofile = duplicateFormatter.serialize(
        catalog,
        defaultSerializeCtx,
      ) as string

      expect(pofile).toMatchSnapshot()
    })

    it("should keep all non-plurals entries intact", () => {
      const duplicateFormatter = createFormat({
        mergePlurals: true,
        origins: true,
      })
      const pluralsCatalog = createCatalog([
        "{count, plural, one {one book} other {many books}}",
        "{anotherCount, plural, one {one book} other {many books}}",
      ])
      const catalog: CatalogType = {
        static: {
          translation: "Static message",
        },
        withOrigin: {
          translation: "Message with origin",
          origin: [["src/App.js", 4]],
        },
        withContext: {
          translation: "Message with context",
          context: "my context",
        },
        Dgzql1: {
          message: "with generated id",
          translation: "",
          context: "my context",
        },
        withMultipleOrigins: {
          translation: "Message with multiple origin",
          origin: [
            ["src/App.js", 4],
            ["src/Component.js", 2],
          ],
        },
        withDescription: {
          translation: "Message with description",
          comments: ["Description is comment from developers to translators"],
        },
        withComments: {
          extra: {
            translatorComments: [
              "Translator comment",
              "This one might come from developer",
            ],
          },
          translation: "Support translator comments separately",
        },
        obsolete: {
          translation: "Obsolete message",
          obsolete: true,
        },
        withFlags: {
          extra: {
            flags: ["fuzzy", "otherFlag"],
          },
          translation: "Keeps any flags that are defined",
        },
        veryLongString: {
          translation:
            "One morning, when Gregor Samsa woke from troubled dreams, he found himself" +
            " transformed in his bed into a horrible vermin. He lay on his armour-like" +
            " back, and if he lifted his head a little he could see his brown belly," +
            " slightly domed and divided by arches into stiff sections. The bedding was" +
            " hardly able to cover it and seemed ready to slide off any moment. His many" +
            " legs, pitifully thin compared with the size of the rest of him, waved about" +
            " helplessly as he looked. \"What's happened to me?\" he thought. It wasn't" +
            " a dream. His room, a proper human",
        },
        withMultiLineComments: {
          translation: "Message with multi line comments",
          comments: [
            `hello
                world
                
                `,
          ],
        },
      }

      const pofile = duplicateFormatter.serialize(
        {
          ...pluralsCatalog,
          ...catalog,
        },
        defaultSerializeCtx,
      )

      expect(pofile).toMatchSnapshot()
    })

    describe("parsing merged plural entries", () => {
      it("should expand merged plural entries back into separate catalog entries", () => {
        const duplicateFormatter = createFormat({ mergePlurals: true })

        // Create a PO file with merged plural entries
        const poContent = `
msgid ""
msgstr ""
"POT-Creation-Date: 2018-08-27 10:00+0000\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"X-Generator: @lingui/cli\\n"
"Language: en\\n"

#: src/App.tsx:60
#: src/App.tsx:66
#. js-lingui:icu={$var, plural, one {one book} other {many books}}&pluralize_on=count,anotherCount
msgid "one book"
msgid_plural "many books"
msgstr[0] "one book"
msgstr[1] "many books"

#: src/App.tsx:70
#: src/App.tsx:76
#. js-lingui:icu={$var, plural, one {one rock} other {# rocks}}&pluralize_on=count,thirdCount
msgid "one rock"
msgid_plural "# rocks"
msgstr[0] "one rock"
msgstr[1] "# rocks"
`

        const catalog = duplicateFormatter.parse(poContent, defaultParseCtx)

        // Should have 4 entries total (2 for each merged plural entry)
        expect(Object.keys(catalog)).toHaveLength(4)

        // Should have entries for both variable names
        expect(catalog).toMatchSnapshot()
      })

      it("should handle single merged entry correctly (no expansion needed)", () => {
        const duplicateFormatter = createFormat({ mergePlurals: true })

        const poContent = `
msgid ""
msgstr ""
"POT-Creation-Date: 2018-08-27 10:00+0000\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"X-Generator: @lingui/cli\\n"
"Language: en\\n"

#: src/App.tsx:60
#. js-lingui:icu=%7Bcount%2C+plural%2C+one+%7Bone+book%7D+other+%7Bmany+books%7D%7D&pluralize_on=count
msgid "one book"
msgid_plural "many books"
msgstr[0] "one book"
msgstr[1] "many books"
`

        const catalog = duplicateFormatter.parse(poContent, defaultParseCtx)

        // Should have only 1 entry (no expansion needed)
        expect(Object.keys(catalog)).toHaveLength(1)
        expect(catalog).toMatchSnapshot()
      })

      it("should work with custom prefix", () => {
        const duplicateFormatter = createFormat({
          mergePlurals: true,
          customICUPrefix: "customprefix:",
        })

        const poContent = `
msgid ""
msgstr ""
"POT-Creation-Date: 2018-08-27 10:00+0000\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"X-Generator: @lingui/cli\\n"
"Language: en\\n"

#: src/App.tsx:60
#: src/App.tsx:66
#. customprefix:icu=%7B$var%2C+plural%2C+one+%7Bone+book%7D+other+%7Bmany+books%7D%7D&pluralize_on=count%2CanotherCount
msgid "one book"
msgid_plural "many books"
msgstr[0] "one book"
msgstr[1] "many books"
`

        const catalog = duplicateFormatter.parse(poContent, defaultParseCtx)

        // Should have 2 entries
        expect(Object.keys(catalog)).toHaveLength(2)
      })

      it("should handle parsing regular PO files without merged data", () => {
        const duplicateFormatter = createFormat({ mergePlurals: true })

        // Use existing fixture file
        const pofile = fs
          .readFileSync(path.join(__dirname, "fixtures/messages_plural.po"))
          .toString()

        const catalog = duplicateFormatter.parse(pofile, defaultParseCtx)

        // Should parse normally without any expansion
        expect(catalog).toMatchSnapshot()
      })

      it("should handle round-trip serialization and parsing", () => {
        const duplicateFormatter = createFormat({ mergePlurals: true })

        // Start with a catalog with duplicate plural entries
        const originalCatalog = createCatalog([
          "{count, plural, one {one book} other {many books}}",
          "{anotherCount, plural, one {one book} other {many books}}",
          "{count, plural, one {one rock} other {# rocks}}",
          "{thirdCount, plural, one {one rock} other {# rocks}}",
        ])

        // Serialize to PO
        const poContent = duplicateFormatter.serialize(
          originalCatalog,
          defaultSerializeCtx,
        ) as string

        // Parse back to catalog
        const parsedCatalog = duplicateFormatter.parse(
          poContent,
          defaultParseCtx,
        )

        expect(parsedCatalog).toMatchObject(originalCatalog)
        expect(parsedCatalog).toMatchSnapshot()
      })
    })
  })
})

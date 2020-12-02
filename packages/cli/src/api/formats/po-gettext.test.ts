import { mockConsole } from "@lingui/jest-mocks"
import fs from "fs"
import mockFs from "mock-fs"
import mockDate from "mockdate"
import path from "path"
import PO from "pofile"

import { CatalogType } from "../catalog"
import format from "./po-gettext"

describe("po-gettext format", () => {
  const dateHeaders = {
    "pot-creation-date": "2018-08-09",
    "po-revision-date": "2018-08-09",
  }

  afterEach(() => {
    mockFs.restore()
    mockDate.reset()
  })

  it("should write catalog in pofile format", () => {
    mockFs({
      locale: {
        en: mockFs.directory(),
      },
    })
    mockDate.set("2018-08-27T10:00Z")

    const filename = path.join("locale", "en", "messages.po")
    const catalog: CatalogType = {
      static: {
        translation: "Static message",
      },
      withOrigin: {
        translation: "Message with origin",
        origin: [["src/App.js", 4]],
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
        extractedComments: [
          "Description is comment from developers to translators",
        ],
      },
      withComments: {
        comments: ["Translator comment", "This one might come from developer"],
        translation: "Support translator comments separately",
      },
      obsolete: {
        translation: "Obsolete message",
        obsolete: true,
      },
      withFlags: {
        flags: ["fuzzy", "otherFlag"],
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
    }

    format.write(filename, catalog, {
      origins: true,
      locale: "en",
      ...dateHeaders,
    })
    const pofile = fs.readFileSync(filename).toString()
    mockFs.restore()
    expect(pofile).toMatchSnapshot()
  })

  it("should read catalog in pofile format", () => {
    const filename = path.join(
      path.resolve(__dirname),
      "fixtures",
      "messages.po"
    )
    const actual = format.read(filename)
    expect(actual).toMatchSnapshot()
  })

  it("should correct badly used comments", () => {
    const po = PO.parse(`
      #. First description
      #. Second comment
      #. Third comment
      msgid "withMultipleDescriptions"
      msgstr "Extra comments are separated from the first description line"

      # Translator comment
      #. Single description only
      #. Second description?
      msgid "withDescriptionAndComments"
      msgstr "Second description joins translator comments"
    `)

    mockFs({
      locale: {
        en: {
          "messages.po": po.toString(),
        },
      },
    })

    const filename = path.join("locale", "en", "messages.po")
    const actual = format.read(filename)
    mockFs.restore()
    expect(actual).toMatchSnapshot()
  })

  it("should throw away additional msgstr if present", () => {
    const po = PO.parse(`
      msgid "withMultipleTranslations"
      msgstr[0] "This is just fine"
      msgstr[1] "Throw away that one"
    `)

    mockFs({
      locale: {
        en: {
          "messages.po": po.toString(),
        },
      },
    })

    const filename = path.join("locale", "en", "messages.po")
    mockConsole((console) => {
      const file = fs.readFileSync(filename).toString()
      const actual = format.parse(file)
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("Multiple translations"),
        "withMultipleTranslations"
      )
      mockFs.restore()
      expect(actual).toMatchSnapshot()
    })
  })

  it("should write the same catalog as it was read", () => {
    const pofile = fs
      .readFileSync(
        path.join(path.resolve(__dirname), "fixtures", "messages.po")
      )
      .toString()

    const filename = path.join(
      path.resolve(__dirname),
      "fixtures",
      "messages.po"
    )
    const catalog = format.read(filename)

    mockFs({
      locale: {
        en: {
          "messages.po": pofile,
        },
      },
    })

    const mock_filename = path.join("locale", "en", "messages.po")
    format.write(mock_filename, catalog, { origins: true, locale: "en" })
    const actual = fs.readFileSync(mock_filename).toString()

    mockFs.restore()

    expect(actual).toEqual(pofile)
  })

  it("should convert ICU plural messages to gettext plurals", function () {
    mockFs({
      locale: {
        en: mockFs.directory(),
      },
    })
    mockDate.set("2018-08-27T10:00Z")

    const filename = path.join("locale", "en", "messages.po")
    const catalog: CatalogType = {
      message_with_id_and_octothorpe: {
        message: "{count, plural, one {Singular} other {Number is #}}",
        translation: "{count, plural, one {Singular} other {Number is #}}",
      },
      message_with_id: {
        message:
          "{someCount, plural, one {Singular case with id\
          and linebreak} other {Case number {someCount} with id}}",
        translation:
          "{someCount, plural, one {Singular case with id} other {Case number {someCount} with id}}",
        extractedComments: [
          "This is a comment by the developers about how the content must be localized.",
        ],
      },
      "{anotherCount, plural, one {Singular case} other {Case number {anotherCount}}}": {
        translation:
          "{anotherCount, plural, one {Singular case} other {Case number {anotherCount}}}",
      },
      // Entry with developer-defined ID that generates empty msgstr[] lines
      message_with_id_but_without_translation: {
        message:
          "{count, plural, one {Singular with id but no translation} other {Plural {count} with empty id but no translation}}",
        translation: "",
      },
      // Entry with automatic ID that generates empty msgstr[] lines
      "{count, plural, one {Singular automatic id no translation} other {Plural {count} automatic id no translation}}": {
        translation: "",
      },
    }

    format.write(filename, catalog, {
      locale: "en",
    })
    const pofile = fs.readFileSync(filename).toString()
    mockFs.restore()
    expect(pofile).toMatchSnapshot()
  })

  it("should convert gettext plurals to ICU plural messages", function () {
    const pofile = fs
      .readFileSync(
        path.join(path.resolve(__dirname), "fixtures", "messages_plural.po")
      )
      .toString()

    const catalog = format.parse(pofile)
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
      format.serialize(catalog, {})

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("Nested plurals"),
        "nested_plural_message"
      )
    })
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
        format.serialize(catalog, {})

        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining("select"),
          "select_message"
        )
      })
    })

    it("should not warn when disabling the warning in config", () => {
      mockConsole((console) => {
        format.serialize(catalog, { disableSelectWarning: true })

        expect(console.warn).not.toHaveBeenCalled()
      })
    })
  })

  describe("when using 'selectOrdinal' format", () => {
    const catalog = {
      select_ordinal_message: {
        message: `{count, selectOrdinal, one {1st} two {2nd} few {3rd} other {#th}}`,
        translation: "",
      },
    }

    it("should warn", () => {
      mockConsole((console) => {
        format.serialize(catalog, {})

        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining("selectOrdinal"),
          "select_ordinal_message"
        )
      })
    })

    it("should not warn when disabling the warning in config", () => {
      mockConsole((console) => {
        format.serialize(catalog, { disableSelectWarning: true })

        expect(console.warn).not.toHaveBeenCalled()
      })
    })
  })
})

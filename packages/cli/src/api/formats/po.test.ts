import fs from "fs"
import path from "path"
import mockFs from "mock-fs"
import mockDate from "mockdate"
import PO from "pofile"
import { mockConsole } from "@lingui/jest-mocks"
import { format as formatDate } from "date-fns"

import format from "./po"
import { CatalogType } from "../catalog"

describe("pofile format", () => {
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
    mockDate.set(new Date(2018, 7, 27, 10, 0, 0).toUTCString())

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

    format.write(filename, catalog, { origins: true, locale: "en" })
    const pofile = fs.readFileSync(filename).toString()
    mockFs.restore()
    expect(pofile).toMatchSnapshot()
  })

  it("should read catalog in pofile format", () => {
    const pofile = fs
      .readFileSync(
        path.join(path.resolve(__dirname), "fixtures", "messages.po")
      )
      .toString()

    mockFs({
      locale: {
        en: {
          "messages.po": pofile,
        },
      },
    })

    const filename = path.join("locale", "en", "messages.po")
    const actual = format.read(filename)
    mockFs.restore()
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
      msgid "withMultipleTranslation"
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
      const actual = format.read(filename)
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("Multiple translations"),
        "withMultipleTranslation"
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

    mockFs({
      locale: {
        en: {
          "messages.po": pofile,
        },
      },
    })

    const filename = path.join("locale", "en", "messages.po")
    const catalog = format.read(filename)
    format.write(filename, catalog, { origins: true, locale: "en" })
    const actual = fs.readFileSync(filename).toString()
    mockFs.restore()
    // on windows mockFs adds ··· to multiline string, so this strictly equal comparison can't be done
    // we test that the content if the same inlined...
    expect(actual.replace(/(\r\n|\n|\r)/gm, "")).toEqual(
      pofile.replace(/(\r\n|\n|\r)/gm, "")
    )
  })

  it("should not include origins if origins option is false", () => {
    mockFs({
      locale: {
        en: mockFs.directory(),
      },
    })

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
    }
    format.write(filename, catalog, { origins: false, locale: "en" })
    const pofile = fs.readFileSync(filename).toString()
    mockFs.restore()
    const pofileOriginPrefix = "#:"
    expect(pofile).toEqual(expect.not.stringContaining(pofileOriginPrefix))
  })

  it("should not include lineNumbers if lineNumbers option is false", () => {
    mockFs({
      locale: {
        en: mockFs.directory(),
      },
    })

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
    }
    format.write(filename, catalog, {
      origins: true,
      lineNumbers: false,
      locale: "en",
    })
    const pofile = fs.readFileSync(filename).toString()
    mockFs.restore()
    expect(pofile).toMatchInlineSnapshot(`
      msgid ""
      msgstr ""
      "POT-Creation-Date: ${formatDate(new Date(), "yyyy-MM-dd HH:mmxxxx")}\\n"
      "MIME-Version: 1.0\\n"
      "Content-Type: text/plain; charset=utf-8\\n"
      "Content-Transfer-Encoding: 8bit\\n"
      "X-Generator: @lingui/cli\\n"
      "Language: en\\n"

      msgid "static"
      msgstr "Static message"

      #: src/App.js
      msgid "withOrigin"
      msgstr "Message with origin"

      #: src/App.js
      #: src/Component.js
      msgid "withMultipleOrigins"
      msgstr "Message with multiple origin"

    `)
  })

  it("should not include lineNumbers if lineNumbers option is false and already excluded", () => {
    mockFs({
      locale: {
        en: mockFs.directory(),
      },
    })

    const filename = path.join("locale", "en", "messages.po")
    const catalog: CatalogType = {
      static: {
        translation: "Static message",
      },
      withOrigin: {
        translation: "Message with origin",
        origin: [["src/App.js"]],
      },
      withMultipleOrigins: {
        translation: "Message with multiple origin",
        origin: [
          ["src/App.js"],
          ["src/Component.js"],
        ],
      },
    }
    format.write(filename, catalog, {
      origins: true,
      lineNumbers: false,
      locale: "en",
    })
    const pofile = fs.readFileSync(filename).toString()
    mockFs.restore()
    expect(pofile).toMatchInlineSnapshot(`
      msgid ""
      msgstr ""
      "POT-Creation-Date: ${formatDate(new Date(), "yyyy-MM-dd HH:mmxxxx")}\\n"
      "MIME-Version: 1.0\\n"
      "Content-Type: text/plain; charset=utf-8\\n"
      "Content-Transfer-Encoding: 8bit\\n"
      "X-Generator: @lingui/cli\\n"
      "Language: en\\n"

      msgid "static"
      msgstr "Static message"

      #: src/App.js
      msgid "withOrigin"
      msgstr "Message with origin"

      #: src/App.js
      #: src/Component.js
      msgid "withMultipleOrigins"
      msgstr "Message with multiple origin"

    `)
  })
})

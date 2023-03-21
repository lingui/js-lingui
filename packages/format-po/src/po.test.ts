import fs from "fs"
import path from "path"

import { formatter as createFormatter } from "./po"
import { CatalogType } from "@lingui/conf"

describe("pofile format", () => {
  jest.useFakeTimers().setSystemTime(new Date("2018-08-27T10:00Z").getTime())

  it("should write catalog in pofile format", () => {
    const format = createFormatter({ origins: true })

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

    const pofile = format.serialize(catalog, {
      locale: "en",
      existing: null,
    })
    expect(pofile).toMatchSnapshot()
  })

  it("should read catalog in pofile format", () => {
    const format = createFormatter()

    const pofile = fs
      .readFileSync(path.join(__dirname, "fixtures/messages.po"))
      .toString()

    const actual = format.parse(pofile)
    expect(actual).toMatchSnapshot()
  })

  it("should serialize and deserialize messages with generated id", () => {
    const format = createFormatter({ origins: true })

    const catalog: CatalogType = {
      // with generated id
      Dgzql1: {
        message: "with generated id",
        translation: "",
        context: "my context",
      },
    }

    const serialized = format.serialize(catalog, {
      locale: "en",
      existing: null,
    })

    const actual = format.parse(serialized)
    expect(actual).toMatchObject(catalog)
  })

  it("should print lingui id if printLinguiId = true", () => {
    const format = createFormatter({ origins: true, printLinguiId: true })

    const catalog: CatalogType = {
      // with generated id
      Dgzql1: {
        message: "with generated id",
        translation: "",
        context: "my context",
      },
    }

    const serialized = format.serialize(catalog, {
      locale: "en",
      existing: null,
    })

    expect(serialized).toMatchSnapshot()
  })

  it("should not add lingui id more than one time", () => {
    const format = createFormatter({ origins: true, printLinguiId: true })

    const catalog: CatalogType = {
      // with generated id
      Dgzql1: {
        message: "with generated id",
        translation: "",
        context: "my context",
        extractedComments: ["js-lingui-id: Dgzql1"],
      },
    }

    const serialized = format.serialize(catalog, {
      locale: "en",
      existing: null,
    })

    expect(serialized).toMatchSnapshot()
  })

  it("should correct badly used comments", () => {
    const format = createFormatter()

    const po = `
      #. First description
      #. Second comment
      #. Third comment
      #, explicit-id
      msgid "withMultipleDescriptions"
      msgstr "Extra comments are separated from the first description line"

      # Translator comment
      #. Single description only
      #. Second description?
      #, explicit-id
      msgid "withDescriptionAndComments"
      msgstr "Second description joins translator comments"
    `

    const actual = format.parse(po)
    expect(actual).toMatchSnapshot()
  })

  it("should not include origins if origins option is false", () => {
    const format = createFormatter({ origins: false })

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

    const actual = format.serialize(catalog, { locale: "en", existing: null })
    const pofileOriginPrefix = "#:"
    expect(actual).toEqual(expect.not.stringContaining(pofileOriginPrefix))
  })

  it("should not include lineNumbers if lineNumbers option is false", () => {
    const format = createFormatter({ origins: true, lineNumbers: false })

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
    const actual = format.serialize(catalog, {
      locale: "en",
      existing: null,
    })

    expect(actual).toMatchInlineSnapshot(`
      msgid ""
      msgstr ""
      "POT-Creation-Date: 2018-08-27 10:00+0000\\n"
      "MIME-Version: 1.0\\n"
      "Content-Type: text/plain; charset=utf-8\\n"
      "Content-Transfer-Encoding: 8bit\\n"
      "X-Generator: @lingui/cli\\n"
      "Language: en\\n"

      #, explicit-id
      msgid "static"
      msgstr "Static message"

      #: src/App.js
      #, explicit-id
      msgid "withOrigin"
      msgstr "Message with origin"

      #: src/App.js
      #: src/Component.js
      #, explicit-id
      msgid "withMultipleOrigins"
      msgstr "Message with multiple origin"

    `)
  })

  it("should not include lineNumbers if lineNumbers option is false and already excluded", () => {
    const format = createFormatter({ origins: true, lineNumbers: false })

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
        origin: [["src/App.js"], ["src/Component.js"]],
      },
    }

    const actual = format.serialize(catalog, {
      locale: "en",
      existing: null,
    })

    expect(actual).toMatchInlineSnapshot(`
      msgid ""
      msgstr ""
      "POT-Creation-Date: 2018-08-27 10:00+0000\\n"
      "MIME-Version: 1.0\\n"
      "Content-Type: text/plain; charset=utf-8\\n"
      "Content-Transfer-Encoding: 8bit\\n"
      "X-Generator: @lingui/cli\\n"
      "Language: en\\n"

      #, explicit-id
      msgid "static"
      msgstr "Static message"

      #: src/App.js
      #, explicit-id
      msgid "withOrigin"
      msgstr "Message with origin"

      #: src/App.js
      #: src/Component.js
      #, explicit-id
      msgid "withMultipleOrigins"
      msgstr "Message with multiple origin"

    `)
  })
})

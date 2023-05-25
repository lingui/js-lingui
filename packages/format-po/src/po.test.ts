import fs from "fs"
import path from "path"

import { formatter as createFormatter, POCatalogExtra } from "./po"
import { CatalogFormatter, CatalogType } from "@lingui/conf"
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

describe("pofile format", () => {
  beforeAll(() => {
    MockDate.set(new Date("2018-08-27T10:00Z"))
  })

  afterAll(() => {
    MockDate.reset()
  })
  it("should write catalog in pofile format", () => {
    const format = createFormatter({ origins: true })

    const catalog: CatalogType<POCatalogExtra> = {
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
    }

    const pofile = format.serialize(catalog, defaultSerializeCtx)
    expect(pofile).toMatchSnapshot()
  })

  it("should read catalog in pofile format", () => {
    const format = createFormatter()

    const pofile = fs
      .readFileSync(path.join(__dirname, "fixtures/messages.po"))
      .toString()

    const actual = format.parse(pofile, defaultParseCtx)
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

    const serialized = format.serialize(catalog, defaultSerializeCtx) as string

    const actual = format.parse(serialized, defaultParseCtx)
    expect(actual).toMatchObject(catalog)
  })

  describe("explicitIdAsDefault", () => {
    const catalog: CatalogType = {
      // with generated id
      Dgzql1: {
        message: "with generated id",
        translation: "",
        context: "my context",
      },

      "custom.id": {
        message: "with explicit id",
        translation: "",
      },
    }

    it("should set `js-lingui-generated-id` for messages with generated id when [explicitIdAsDefault: true]", () => {
      const format = createFormatter({
        origins: true,
        explicitIdAsDefault: true,
      })

      const serialized = format.serialize(
        catalog,
        defaultSerializeCtx
      ) as string

      expect(serialized).toMatchInlineSnapshot(`
        msgid ""
        msgstr ""
        "POT-Creation-Date: 2018-08-27 10:00+0000\\n"
        "MIME-Version: 1.0\\n"
        "Content-Type: text/plain; charset=utf-8\\n"
        "Content-Transfer-Encoding: 8bit\\n"
        "X-Generator: @lingui/cli\\n"
        "Language: en\\n"

        #. js-lingui-generated-id
        msgctxt "my context"
        msgid "with generated id"
        msgstr ""

        msgid "custom.id"
        msgstr ""

      `)

      const actual = format.parse(serialized, defaultParseCtx)
      expect(actual).toMatchInlineSnapshot(`
        {
          Dgzql1: {
            comments: [
              js-lingui-generated-id,
            ],
            context: my context,
            extra: {
              flags: [],
              translatorComments: [],
            },
            message: with generated id,
            obsolete: false,
            origin: [],
            translation: ,
          },
          custom.id: {
            comments: [],
            context: null,
            extra: {
              flags: [],
              translatorComments: [],
            },
            obsolete: false,
            origin: [],
            translation: ,
          },
        }
      `)
    })

    it("should set `js-explicit-id` for messages with explicit id when [explicitIdAsDefault: false]", () => {
      const format = createFormatter({
        origins: true,
        explicitIdAsDefault: false,
      })

      const serialized = format.serialize(
        catalog,
        defaultSerializeCtx
      ) as string

      expect(serialized).toMatchInlineSnapshot(`
        msgid ""
        msgstr ""
        "POT-Creation-Date: 2018-08-27 10:00+0000\\n"
        "MIME-Version: 1.0\\n"
        "Content-Type: text/plain; charset=utf-8\\n"
        "Content-Transfer-Encoding: 8bit\\n"
        "X-Generator: @lingui/cli\\n"
        "Language: en\\n"

        msgctxt "my context"
        msgid "with generated id"
        msgstr ""

        #. js-lingui-explicit-id
        msgid "custom.id"
        msgstr ""

      `)

      const actual = format.parse(serialized, defaultParseCtx)
      expect(actual).toMatchInlineSnapshot(`
        {
          Dgzql1: {
            comments: [],
            context: my context,
            extra: {
              flags: [],
              translatorComments: [],
            },
            message: with generated id,
            obsolete: false,
            origin: [],
            translation: ,
          },
          custom.id: {
            comments: [
              js-lingui-explicit-id,
            ],
            context: null,
            extra: {
              flags: [],
              translatorComments: [],
            },
            obsolete: false,
            origin: [],
            translation: ,
          },
        }
      `)
    })
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

    const serialized = format.serialize(catalog, defaultSerializeCtx)

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
        comments: ["js-lingui-id: Dgzql1"],
      },
    }

    const serialized = format.serialize(catalog, defaultSerializeCtx)

    expect(serialized).toMatchSnapshot()
  })

  it("should correct badly used comments", () => {
    const format = createFormatter()

    const po = `
      #. First description
      #. Second comment
      #. Third comment
      #. js-lingui-explicit-id
      msgid "withMultipleDescriptions"
      msgstr "Extra comments are separated from the first description line"

      # Translator comment
      #. Single description only
      #. Second description?
      #. js-lingui-explicit-id
      msgid "withDescriptionAndComments"
      msgstr "Second description joins translator comments"
    `

    const actual = format.parse(po, defaultParseCtx)
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

    const actual = format.serialize(catalog, defaultSerializeCtx)
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
    const actual = format.serialize(catalog, defaultSerializeCtx)

    expect(actual).toMatchInlineSnapshot(`
      msgid ""
      msgstr ""
      "POT-Creation-Date: 2018-08-27 10:00+0000\\n"
      "MIME-Version: 1.0\\n"
      "Content-Type: text/plain; charset=utf-8\\n"
      "Content-Transfer-Encoding: 8bit\\n"
      "X-Generator: @lingui/cli\\n"
      "Language: en\\n"

      #. js-lingui-explicit-id
      msgid "static"
      msgstr "Static message"

      #. js-lingui-explicit-id
      #: src/App.js
      msgid "withOrigin"
      msgstr "Message with origin"

      #. js-lingui-explicit-id
      #: src/App.js
      #: src/Component.js
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

    const actual = format.serialize(catalog, defaultSerializeCtx)

    expect(actual).toMatchInlineSnapshot(`
      msgid ""
      msgstr ""
      "POT-Creation-Date: 2018-08-27 10:00+0000\\n"
      "MIME-Version: 1.0\\n"
      "Content-Type: text/plain; charset=utf-8\\n"
      "Content-Transfer-Encoding: 8bit\\n"
      "X-Generator: @lingui/cli\\n"
      "Language: en\\n"

      #. js-lingui-explicit-id
      msgid "static"
      msgstr "Static message"

      #. js-lingui-explicit-id
      #: src/App.js
      msgid "withOrigin"
      msgstr "Message with origin"

      #. js-lingui-explicit-id
      #: src/App.js
      #: src/Component.js
      msgid "withMultipleOrigins"
      msgstr "Message with multiple origin"

    `)
  })
})

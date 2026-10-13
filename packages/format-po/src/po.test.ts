import fs from "fs"
import path from "path"

import { CatalogFormatter, CatalogType } from "@lingui/conf"
import { formatter as createFormatter, parsePoFile, POCatalogExtra } from "./po"

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

describe("pofile format", () => {
  beforeAll(() => {
    vi.setSystemTime(new Date("2018-08-27T10:00Z"))
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
      withMultiLineComments: {
        translation: "Message with multi line comments",
        comments: [
          `hello
          world
          
          `,
        ],
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

  it("should read an obsolete message following an active message", () => {
    const format = createFormatter()
    const actual = format.parse(
      `msgid ""
msgstr ""
"Language: en\\n"

msgid "Active message"
msgstr ""

#~ msgid "Obsolete message"
#~ msgstr ""
`,
      defaultParseCtx,
    )

    const obsoleteMessage = Object.values(actual).find(
      (message) => message.message === "Obsolete message",
    )

    expect(obsoleteMessage?.obsolete).toBe(true)
  })

  it.each([
    {
      name: "active before obsolete",
      entries: `#. js-lingui-explicit-id
msgid "Hello World"
msgstr ""

#~ msgid "Hello World"
#~ msgstr "Ahoj Brno"
`,
      obsoleteTranslation: "Ahoj Brno",
    },
    {
      name: "obsolete before active",
      entries: `#~ msgid "Hello World"
#~ msgstr "Ahoj Brno"

#. js-lingui-explicit-id
msgid "Hello World"
msgstr ""
`,
      obsoleteTranslation: "Ahoj Brno",
    },
    {
      name: "multiple obsolete entries before active",
      entries: `#~ msgid "Hello World"
#~ msgstr "Ahoj Brno"

#~ msgid "Hello World"
#~ msgstr "Ahoj Prague"

#. js-lingui-explicit-id
msgid "Hello World"
msgstr ""
`,
      obsoleteTranslation: "Ahoj Prague",
    },
  ])(
    "should preserve obsolete state when $name",
    ({ entries, obsoleteTranslation }) => {
      const format = createFormatter()
      const actual = format.parse(
        `msgid ""
msgstr ""
"Language: en\\n"

${entries}`,
        defaultParseCtx,
      )

      const messages = Object.values(actual)
      const activeMessage = messages.find((message) => !message.obsolete)
      const obsoleteMessage = messages.find((message) => message.obsolete)

      expect(messages).toHaveLength(2)
      expect(activeMessage?.translation).toBe("")
      expect(obsoleteMessage?.translation).toBe(obsoleteTranslation)
    },
  )

  it("should preserve obsolete state for duplicate entries with different contexts", () => {
    const format = createFormatter()
    const actual = format.parse(
      `msgid ""
msgstr ""
"Language: en\\n"

#~ msgctxt "first"
#~ msgid "Hello World"
#~ msgstr "Ahoj Brno"

#. js-lingui-explicit-id
msgctxt "first"
msgid "Hello World"
msgstr ""

#~ msgctxt "second"
#~ msgid "Hello World"
#~ msgstr "Ahoj Prague"
`,
      defaultParseCtx,
    )

    const messages = Object.values(actual)
    const firstContextMessages = messages.filter(
      (message) => message.context === "first",
    )
    const secondContextMessages = messages.filter(
      (message) => message.context === "second",
    )

    expect(messages).toHaveLength(3)
    expect(firstContextMessages).toHaveLength(2)
    expect(
      firstContextMessages.find((message) => !message.obsolete)?.translation,
    ).toBe("")
    expect(
      firstContextMessages.find((message) => message.obsolete)?.translation,
    ).toBe("Ahoj Brno")
    expect(secondContextMessages).toHaveLength(1)
    expect(secondContextMessages[0].obsolete).toBe(true)
    expect(secondContextMessages[0].translation).toBe("Ahoj Prague")
  })

  it.each([
    {
      name: "active before obsolete",
      entries: `msgctxt "menu"
msgid "Hello "
"world"
msgstr "active"
#~ msgctxt "menu"
#~ msgid "Hello "
#~ "world"
#~ msgstr "obsolete"
`,
    },
    {
      name: "obsolete before active",
      entries: `#~ msgctxt "menu"
#~ msgid "Hello "
#~ "world"
#~ msgstr "obsolete"
msgctxt "menu"
msgid "Hello "
"world"
msgstr "active"
`,
    },
  ])(
    "should preserve source order for adjacent multiline duplicates when $name",
    ({ entries }) => {
      const content = `msgid ""
msgstr ""
"Language: en\\n"

${entries}`
      const po = parsePoFile(content)

      expect(
        po.items.map((item) => ({
          msgid: item.msgid,
          msgctxt: item.msgctxt,
          translation: item.msgstr[0],
          obsolete: item.obsolete,
        })),
      ).toEqual([
        {
          msgid: "Hello world",
          msgctxt: "menu",
          translation: entries.startsWith("#~") ? "obsolete" : "active",
          obsolete: entries.startsWith("#~"),
        },
        {
          msgid: "Hello world",
          msgctxt: "menu",
          translation: entries.startsWith("#~") ? "active" : "obsolete",
          obsolete: !entries.startsWith("#~"),
        },
      ])

      const catalog = createFormatter().parse(content, defaultParseCtx)
      const message = Object.values(catalog).find(
        (item) => item.context === "menu",
      )

      expect(message).toMatchObject({
        message: "Hello world",
        translation: "active",
        obsolete: false,
      })
    },
  )

  it("should preserve obsolete markers for multiple multiline duplicates with different contexts", () => {
    const content = `msgid ""
msgstr ""
"Language: en\\n"

#~ msgctxt "menu"
#~ msgid "Hello "
#~ "world"
#~ msgstr "obsolete menu 1"
#~ msgctxt "menu"
#~ msgid "Hello "
#~ "world"
#~ msgstr "obsolete menu 2"
msgctxt "menu"
msgid "Hello "
"world"
msgstr "active menu"
#~ msgctxt "toolbar"
#~ msgid "Hello "
#~ "world"
#~ msgstr "obsolete toolbar"
`
    const po = parsePoFile(content)

    expect(
      po.items.map((item) => ({
        msgid: item.msgid,
        msgctxt: item.msgctxt,
        translation: item.msgstr[0],
        obsolete: item.obsolete,
      })),
    ).toEqual([
      {
        msgid: "Hello world",
        msgctxt: "menu",
        translation: "obsolete menu 1",
        obsolete: true,
      },
      {
        msgid: "Hello world",
        msgctxt: "menu",
        translation: "obsolete menu 2",
        obsolete: true,
      },
      {
        msgid: "Hello world",
        msgctxt: "menu",
        translation: "active menu",
        obsolete: false,
      },
      {
        msgid: "Hello world",
        msgctxt: "toolbar",
        translation: "obsolete toolbar",
        obsolete: true,
      },
    ])

    const catalog = createFormatter().parse(content, defaultParseCtx)
    expect(Object.values(catalog)).toHaveLength(2)
    expect(
      Object.values(catalog).find((item) => item.context === "menu"),
    ).toMatchObject({ translation: "active menu", obsolete: false })
    expect(
      Object.values(catalog).find((item) => item.context === "toolbar"),
    ).toMatchObject({ translation: "obsolete toolbar", obsolete: true })
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

  it("should print source message as translation for source locale catalog for explicit id", () => {
    const format = createFormatter({ origins: true })

    const catalog: CatalogType = {
      "custom.id": {
        message: "with custom id",
        translation: "",
        context: "my context",
      },
      Dgzql1: {
        message: "with generated id",
        translation: "",
        context: "my context",
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
        defaultSerializeCtx,
      ) as string

      expect(serialized).toMatchInlineSnapshot(`
        "msgid ""
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
        msgstr "with explicit id"
        "
      `)

      const actual = format.parse(serialized, defaultParseCtx)
      expect(actual).toMatchInlineSnapshot(`
        {
          "Dgzql1": {
            "comments": [],
            "context": "my context",
            "extra": {
              "flags": [],
              "translatorComments": [],
            },
            "message": "with generated id",
            "obsolete": false,
            "origin": [],
            "translation": "",
          },
          "custom.id": {
            "comments": [],
            "context": undefined,
            "extra": {
              "flags": [],
              "translatorComments": [],
            },
            "obsolete": false,
            "origin": [],
            "translation": "with explicit id",
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
        defaultSerializeCtx,
      ) as string

      expect(serialized).toMatchInlineSnapshot(`
        "msgid ""
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
        msgstr "with explicit id"
        "
      `)

      const actual = format.parse(serialized, defaultParseCtx)
      expect(actual).toMatchInlineSnapshot(`
        {
          "Dgzql1": {
            "comments": [],
            "context": "my context",
            "extra": {
              "flags": [],
              "translatorComments": [],
            },
            "message": "with generated id",
            "obsolete": false,
            "origin": [],
            "translation": "",
          },
          "custom.id": {
            "comments": [],
            "context": undefined,
            "extra": {
              "flags": [],
              "translatorComments": [],
            },
            "obsolete": false,
            "origin": [],
            "translation": "with explicit id",
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
      "msgid ""
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
      "
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
      "msgid ""
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
      "
    `)
  })

  it("should deduplicate file references when lineNumbers option is false", () => {
    const format = createFormatter({ origins: true, lineNumbers: false })

    const catalog: CatalogType = {
      withDuplicateOrigins: {
        translation: "Message with duplicate origins",
        origin: [
          ["src/App.js", 4],
          ["src/App.js", 20],
          ["src/Component.js", 2],
          ["src/App.js", 55],
          ["src/Component.js", 8],
        ],
      },
    }

    const actual = format.serialize(catalog, defaultSerializeCtx)

    expect(actual).toMatchInlineSnapshot(`
      "msgid ""
      msgstr ""
      "POT-Creation-Date: 2018-08-27 10:00+0000\\n"
      "MIME-Version: 1.0\\n"
      "Content-Type: text/plain; charset=utf-8\\n"
      "Content-Transfer-Encoding: 8bit\\n"
      "X-Generator: @lingui/cli\\n"
      "Language: en\\n"

      #. js-lingui-explicit-id
      #: src/App.js
      #: src/Component.js
      msgid "withDuplicateOrigins"
      msgstr "Message with duplicate origins"
      "
    `)
  })

  it("should include custom header attributes", () => {
    const format = createFormatter({
      customHeaderAttributes: { "X-Custom-Attribute": "custom-value" },
    })
    const catalog: CatalogType = {}
    const actual = format.serialize(catalog, defaultSerializeCtx)

    expect(actual).toMatchInlineSnapshot(`
      "msgid ""
      msgstr ""
      "POT-Creation-Date: 2018-08-27 10:00+0000\\n"
      "MIME-Version: 1.0\\n"
      "Content-Type: text/plain; charset=utf-8\\n"
      "Content-Transfer-Encoding: 8bit\\n"
      "X-Generator: @lingui/cli\\n"
      "Language: en\\n"
      "X-Custom-Attribute: custom-value\\n"
      "
    `)
  })

  it("should be idempotent after serializing over an existing file", async () => {
    const format = createFormatter()
    const catalog: CatalogType = {}

    const first = await format.serialize(catalog, defaultSerializeCtx)
    const second = await format.serialize(catalog, {
      ...defaultSerializeCtx,
      existing: first,
    })

    expect(second).toBe(first)
  })

  it("should preserve existing POT-Creation-Date by default", () => {
    const format = createFormatter()
    const catalog: CatalogType = {}

    const actual = format.serialize(catalog, {
      ...defaultSerializeCtx,
      existing: `msgid ""
msgstr ""
"POT-Creation-Date: 2000-01-01 00:00+0000\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"X-Generator: @lingui/cli\\n"
"Language: en\\n"
`,
    })

    expect(actual).toContain(`"POT-Creation-Date: 2000-01-01 00:00+0000\\n"`)
  })

  it("should preserve existing headers and their order", async () => {
    const format = createFormatter()
    const catalog: CatalogType = {}

    const actual = await format.serialize(catalog, {
      ...defaultSerializeCtx,
      existing: `msgid ""
msgstr ""
"Language: legacy\\n"
"X-Generator: legacy-tool\\n"
"MIME-Version: 0.9\\n"
"Content-Type: application/x-legacy\\n"
"POT-Creation-Date: 2000-01-01 00:00+0000\\n"
"X-Custom-Header: legacy-value\\n"
`,
    })

    const expectedHeaders = [
      '"Language: legacy\\n"',
      '"X-Generator: legacy-tool\\n"',
      '"MIME-Version: 0.9\\n"',
      '"Content-Type: application/x-legacy\\n"',
      '"POT-Creation-Date: 2000-01-01 00:00+0000\\n"',
      '"X-Custom-Header: legacy-value\\n"',
    ]

    expectedHeaders.forEach((header) => {
      expect(actual).toContain(header)
    })

    for (let index = 1; index < expectedHeaders.length; index++) {
      expect(actual.indexOf(expectedHeaders[index - 1]!)).toBeLessThan(
        actual.indexOf(expectedHeaders[index]!),
      )
    }
  })

  it("should preserve header comments when serializing over an existing file", () => {
    const format = createFormatter()
    const catalog: CatalogType = {}

    const actual = format.serialize(catalog, {
      ...defaultSerializeCtx,
      existing: `# Translator header comment
#. Extracted header comment
msgid ""
msgstr ""
"POT-Creation-Date: 2000-01-01 00:00+0000\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"X-Generator: @lingui/cli\\n"
"Language: en\\n"
`,
    })

    expect(actual).toContain("# Translator header comment")
    expect(actual).toContain("#. Extracted header comment")
  })

  it("should override POT-Creation-Date when provided in custom header attributes", () => {
    const format = createFormatter({
      customHeaderAttributes: { "POT-Creation-Date": "" },
    })
    const catalog: CatalogType = {}

    const actual = format.serialize(catalog, {
      ...defaultSerializeCtx,
      existing: `msgid ""
msgstr ""
"POT-Creation-Date: 2000-01-01 00:00+0000\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"X-Generator: @lingui/cli\\n"
"Language: en\\n"
`,
    })

    expect(actual).toContain(`"POT-Creation-Date: \\n"`)
  })

  it("should apply custom header attributes when serializing over an existing file", () => {
    const format = createFormatter({
      customHeaderAttributes: { "X-Custom-Attribute": "custom-value" },
    })
    const catalog: CatalogType = {}

    const actual = format.serialize(catalog, {
      ...defaultSerializeCtx,
      existing: `msgid ""
msgstr ""
"POT-Creation-Date: 2000-01-01 00:00+0000\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"X-Generator: @lingui/cli\\n"
"Language: en\\n"
`,
    })

    expect(actual).toContain(`"X-Custom-Attribute: custom-value\\n"`)
  })

  it("should use new headers when serializing over an empty existing file", () => {
    const format = createFormatter({
      customHeaderAttributes: { "X-Custom-Attribute": "custom-value" },
    })
    const catalog: CatalogType = {}

    const actual = format.serialize(catalog, {
      ...defaultSerializeCtx,
      existing: "",
    })

    expect(actual).toContain(`"MIME-Version: 1.0\\n"`)
    expect(actual).toContain(`"Language: en\\n"`)
    expect(actual).toContain(`"X-Custom-Attribute: custom-value\\n"`)
  })

  it("should let custom header attributes override existing headers", () => {
    const format = createFormatter({
      customHeaderAttributes: {
        "X-Generator": "custom-generator",
        "X-Custom-Attribute": "custom-value",
      },
    })
    const catalog: CatalogType = {}

    const actual = format.serialize(catalog, {
      ...defaultSerializeCtx,
      existing: `msgid ""
msgstr ""
"X-Generator: legacy-generator\\n"
"X-Custom-Attribute: legacy-value\\n"
`,
    })

    expect(actual).toContain(`"X-Generator: custom-generator\\n"`)
    expect(actual).toContain(`"X-Custom-Attribute: custom-value\\n"`)
    expect(actual).not.toContain(`"X-Generator: legacy-generator\\n"`)
    expect(actual).not.toContain(`"X-Custom-Attribute: legacy-value\\n"`)
  })

  it("should preserve empty default headers when serializing over an existing file", () => {
    const format = createFormatter()
    const catalog: CatalogType = {}

    const actual = format.serialize(catalog, {
      ...defaultSerializeCtx,
      existing: `msgid ""
msgstr ""
"POT-Creation-Date: 2000-01-01 00:00+0000\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"X-Generator: @lingui/cli\\n"
"Language: en\\n"
"Project-Id-Version: \\n"
"Report-Msgid-Bugs-To: \\n"
"PO-Revision-Date: \\n"
"Last-Translator: \\n"
"Language-Team: \\n"
"Plural-Forms: \\n"
`,
    })

    expect(actual).toContain(`"Project-Id-Version: \\n"`)
    expect(actual).toContain(`"Plural-Forms: \\n"`)
  })

  it("should keep lineNumbers disabled when serializing over an existing file", async () => {
    const format = createFormatter({ origins: true, lineNumbers: false })
    const catalog: CatalogType = {
      withOrigin: {
        translation: "Message with origin",
        origin: [["src/App.js", 4]],
      },
    }

    const existing = await format.serialize(catalog, defaultSerializeCtx)
    const actual = await format.serialize(catalog, {
      ...defaultSerializeCtx,
      existing,
    })

    expect(actual).toContain(`#: src/App.js`)
    expect(actual).not.toContain(`#: src/App.js:4`)
  })

  describe("foldLength", () => {
    it("should not fold by default", () => {
      const format = createFormatter()

      const catalog: CatalogType = {
        veryLongString: {
          translation:
            "One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.",
        },
      }

      const actual = format.serialize(catalog, defaultSerializeCtx)
      expect(actual).toMatchSnapshot()
    })

    it("should fold at custom length", () => {
      const format = createFormatter({ foldLength: 40 })

      const catalog: CatalogType = {
        veryLongString: {
          translation:
            "One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.",
        },
      }

      const actual = format.serialize(catalog, defaultSerializeCtx)
      expect(actual).toMatchSnapshot()
    })
  })

  describe("compactMultiline", () => {
    it("should use non-compact format when compactMultiline is false", () => {
      const format = createFormatter({ compactMultiline: false })

      const catalog: CatalogType = {
        multiline: {
          translation: "First line\nSecond line\nThird line",
        },
      }

      const actual = format.serialize(catalog, defaultSerializeCtx)
      expect(actual).toMatchSnapshot()
    })

    it("should use compact format when compactMultiline is true", () => {
      const format = createFormatter({ compactMultiline: true })

      const catalog: CatalogType = {
        multiline: {
          translation: "First line\nSecond line\nThird line",
        },
      }

      const actual = format.serialize(catalog, defaultSerializeCtx)
      expect(actual).toMatchSnapshot()
    })
  })

  describe("printPlaceholdersInComments", () => {
    it("should print unnamed placeholders as comments", () => {
      const format = createFormatter()

      const catalog: CatalogType = {
        static: {
          message: "Static message {0} {name}",
          translation: "Static message {0} {name}",
          placeholders: {
            0: ["getValue()"],
            name: ["user.getName()"],
          },
        },
        // should not push placeholder comment twice
        static2: {
          message: "Static message {0} {name}",
          translation: "Static message {0} {name}",
          comments: ["placeholder: {0} = getValue()"],
          placeholders: {
            0: ["getValue()"],
            name: ["user.getName()"],
          },
        },
        // multiline placeholder value + multiple entries
        static3: {
          message: "Static message {0}",
          translation: "Static message {0}",
          placeholders: {
            0: ["user \n ? user.name \n : null", "userName"],
          },
        },

        // should limit to 3 by default
        static4: {
          message: "Static message {0}",
          translation: "Static message {0}",
          placeholders: {
            0: ["userName", "user.name", "profile.name", "authorName"],
          },
        },

        // Should not erase existing comments if message does not have placeholder
        // https://github.com/lingui/js-lingui/issues/2542
        static5: {
          message: "Static message {0}",
          comments: ["placeholder: {0} = getValue()"],
          translation: "Static message {0}",
        },
      }

      const actual = format.serialize(catalog, defaultSerializeCtx)
      expect(actual).toMatchSnapshot()
    })

    it("Should not print placeholders if printPlaceholdersInComments = false", () => {
      const format = createFormatter({ printPlaceholdersInComments: false })

      const catalog: CatalogType = {
        static: {
          message: "Static message {0} {name}",
          translation: "Static message {0} {name}",
          placeholders: {
            0: ["getValue()"],
            name: ["user.getName()"],
          },
        },
      }

      const actual = format.serialize(catalog, defaultSerializeCtx)
      expect(actual).toMatchSnapshot()
    })

    it("Should print printPlaceholdersInComments.limit amount of values for placeholder", () => {
      const format = createFormatter({
        printPlaceholdersInComments: {
          limit: 1,
        },
      })

      const catalog: CatalogType = {
        static: {
          message: "Static message {0} {1}",
          translation: "Static message {0} {1}",
          placeholders: {
            0: ["userName", "user.name", "profile.name", "authorName"],
            1: ["a", "b", "c", "d"],
          },
        },
      }

      const actual = format.serialize(catalog, defaultSerializeCtx)
      expect(actual).toMatchSnapshot()
    })
  })
})

import { FormatterWrapper } from "./formatterWrapper"
import mockFs from "mock-fs"
import fs from "fs"

describe("FormatterWrapper", () => {
  it("should return template and catalog extension", () => {
    const wrapper = new FormatterWrapper(
      {
        serialize: () => "",
        parse: () => ({}),
        catalogExtension: ".po",
        templateExtension: ".pot",
      },
      "en"
    )

    expect(wrapper.getCatalogExtension()).toBe(".po")
    expect(wrapper.getTemplateExtension()).toBe(".pot")
  })
  it("should return catalog extension for templateExtension if not defined", () => {
    const wrapper = new FormatterWrapper(
      {
        serialize: () => "",
        parse: () => ({}),
        catalogExtension: ".po",
        templateExtension: null,
      },
      "en"
    )

    expect(wrapper.getCatalogExtension()).toBe(".po")
    expect(wrapper.getTemplateExtension()).toBe(".po")
  })

  describe("read", () => {
    it("should not throw if file not exists", async () => {
      const format = new FormatterWrapper(
        {
          serialize: () => "",
          parse: () => ({}),
          catalogExtension: ".po",
          templateExtension: ".pot",
        },
        "en"
      )

      mockFs({})

      const actual = await format.read("locale/en/messages.json", "en")
      mockFs.restore()
      expect(actual).toBeNull()
    })

    it("should read file from FS and parse using provided formatter", async () => {
      const parseMock = jest
        .fn()
        .mockImplementation((content: string) => content.split(",") as any)
      const format = new FormatterWrapper(
        {
          serialize: () => "",
          parse: parseMock,
          catalogExtension: ".po",
          templateExtension: ".pot",
        },
        "en"
      )

      mockFs({
        "test.file": "red,green,blue",
      })

      const actual = await format.read("test.file", "en")
      mockFs.restore()
      expect(parseMock.mock.calls[0]).toMatchInlineSnapshot(`
        [
          red,green,blue,
          {
            filename: test.file,
            locale: en,
            sourceLocale: en,
          },
        ]
      `)
      expect(actual).toStrictEqual(["red", "green", "blue"])
    })

    it("should rethrow error with filename if failed to parse file", async () => {
      const format = new FormatterWrapper(
        {
          serialize: () => "",
          parse: () => {
            throw new Error("Unable to parse")
          },
          catalogExtension: ".po",
          templateExtension: ".pot",
        },
        "en"
      )

      mockFs({
        "test.file": "blabla",
      })

      expect.assertions(1)

      await format.read("test.file", "en").catch((e) => {
        expect(e.message).toContain("Cannot read test.file Unable to parse")
      })

      mockFs.restore()
    })
  })

  describe("write", () => {
    it("should write to FS and serialize catalog using provided formatter", async () => {
      const format = new FormatterWrapper(
        {
          serialize: (catalog) => JSON.stringify(catalog),
          parse: () => ({}),
          catalogExtension: ".po",
          templateExtension: ".pot",
        },
        "en"
      )

      mockFs({})

      const catalog = {
        static: {
          translation: "Static message",
        },
      }

      const filename = "locale/en/messages.json"
      await format.write(filename, catalog, "en")
      const content = fs.readFileSync(filename).toString()
      mockFs.restore()
      expect(content).toMatchInlineSnapshot(
        `{"static":{"translation":"Static message"}}`
      )
    })

    it("should pass context to the formatter", async () => {
      const serializeMock = jest
        .fn()
        .mockImplementation((catalog) => JSON.stringify(catalog))

      const format = new FormatterWrapper(
        {
          serialize: serializeMock,
          parse: () => ({}),
          catalogExtension: ".po",
          templateExtension: ".pot",
        },
        "en"
      )

      mockFs({
        "messages.json": `{"existing":{"translation":"Existing message"}}`,
      })

      const catalog = {
        static: {
          translation: "Static message",
        },
      }

      const filename = "messages.json"
      await format.write(filename, catalog, "en")
      const content = fs.readFileSync(filename).toString()
      mockFs.restore()

      expect(serializeMock.mock.calls[0]).toMatchInlineSnapshot(`
        [
          {
            static: {
              translation: Static message,
            },
          },
          {
            existing: {"existing":{"translation":"Existing message"}},
            filename: messages.json,
            locale: en,
            sourceLocale: en,
          },
        ]
      `)
      expect(content).toMatchInlineSnapshot(
        `{"static":{"translation":"Static message"}}`
      )
    })

    it("should write only if file was changed", async () => {
      const format = new FormatterWrapper(
        {
          serialize: (catalog) => JSON.stringify(catalog),
          parse: () => ({}),
          catalogExtension: ".po",
          templateExtension: ".pot",
        },
        "en"
      )

      const catalog = {
        static: {
          translation: "Static message",
        },
      }

      mockFs({
        "messages.json": JSON.stringify(catalog),
      })

      const filename = "messages.json"
      const origStat = fs.statSync(filename)

      await format.write(filename, catalog, "en")
      const afterWriteStat = fs.statSync(filename)

      mockFs.restore()

      expect(origStat.mtime).toStrictEqual(afterWriteStat.mtime)
    })
  })
})

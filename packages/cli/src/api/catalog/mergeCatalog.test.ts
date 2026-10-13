import {
  defaultMergeOptions,
  makeNextMessage,
  makePrevMessage,
} from "../../tests.js"
import { mergeCatalog } from "./mergeCatalog.js"
import { CatalogType, ExtractedCatalogType } from "../types.js"

describe("mergeCatalog", () => {
  const nextCatalog: ExtractedCatalogType = {
    "custom.id": makeNextMessage({
      message: "Message with custom ID",
    }),
    "Message with <0>auto-generated</0> ID": makeNextMessage(),
  }

  it("should initialize language catalog", () => {
    expect(
      mergeCatalog(undefined, nextCatalog, false, defaultMergeOptions),
    ).toEqual({
      "custom.id": expect.objectContaining({
        message: "Message with custom ID",
        translation: "",
      }),
      "Message with <0>auto-generated</0> ID": expect.objectContaining({
        translation: "",
      }),
    })
  })

  it("should prefill translations for source language", () => {
    expect(
      mergeCatalog(undefined, nextCatalog, true, defaultMergeOptions),
    ).toEqual({
      "custom.id": expect.objectContaining({
        message: "Message with custom ID",
        translation: "Message with custom ID",
      }),
      "Message with <0>auto-generated</0> ID": expect.objectContaining({
        translation: "Message with <0>auto-generated</0> ID",
      }),
    })
  })

  it("should merge translations from existing catalogs", () => {
    const prevCatalog: CatalogType = {
      "custom.id": makePrevMessage({
        message: "Message with custom ID",
        translation: "Translation of message with custom ID",
      }),
      "Message with <0>auto-generated</0> ID": makePrevMessage({
        translation: "Translation of message with auto-generated ID",
      }),
    }

    const nextCatalog: ExtractedCatalogType = {
      "custom.id": makeNextMessage({
        message: "Message with custom ID, possibly changed",
      }),
      "new.id": makeNextMessage({
        message: "Completely new message",
      }),
      "Message with <0>auto-generated</0> ID": makeNextMessage(),
      "New message": makeNextMessage(),
    }

    expect(
      mergeCatalog(prevCatalog, nextCatalog, false, defaultMergeOptions),
    ).toEqual({
      "custom.id": expect.objectContaining({
        message: "Message with custom ID, possibly changed",
        translation: "Translation of message with custom ID",
      }),
      "new.id": expect.objectContaining({
        message: "Completely new message",
        translation: "",
      }),
      "Message with <0>auto-generated</0> ID": expect.objectContaining({
        translation: "Translation of message with auto-generated ID",
      }),
      "New message": expect.objectContaining({
        translation: "",
      }),
    })
  })

  it("should overwrite translations for source locale when overwrite: true", () => {
    const prevCatalog: CatalogType = {
      message1: makePrevMessage({
        message: "",
        translation: "translation for source message1",
      }),
      message2: makePrevMessage({
        translation: "translation for source message2",
      }),
    }

    const nextCatalog: ExtractedCatalogType = {
      message1: makeNextMessage({
        message: "Message with custom ID, possibly changed",
      }),
      message2: makeNextMessage({
        message: "New source message for message2",
      }),
    }

    expect(
      mergeCatalog(prevCatalog, nextCatalog, true, {
        overwrite: true,
      }),
    ).toEqual({
      message1: expect.objectContaining({
        message: "Message with custom ID, possibly changed",
        translation: "Message with custom ID, possibly changed",
      }),
      message2: expect.objectContaining({
        translation: "New source message for message2",
      }),
    })
  })

  it("should mark obsolete messages", () => {
    const prevCatalog: CatalogType = {
      "msg.hello": makePrevMessage({
        translation: "Hello World",
      }),
    }
    const nextCatalog: ExtractedCatalogType = {}
    expect(
      mergeCatalog(prevCatalog, nextCatalog, false, defaultMergeOptions),
    ).toEqual({
      "msg.hello": expect.objectContaining({
        translation: "Hello World",
        obsolete: true,
      }),
    })
  })

  it("should not mark as obsolete when files option passed", () => {
    const prevCatalog: CatalogType = {
      "msg.hello": makePrevMessage({
        translation: "Hello World",
      }),
    }
    const nextCatalog: ExtractedCatalogType = {}
    const mergedCatalog = mergeCatalog(prevCatalog, nextCatalog, false, {
      files: ["file"],
    })

    expect(mergedCatalog["msg.hello"]!.obsolete).toBeFalsy()
  })

  it("should keep message extra from the previous catalog", () => {
    const prevCatalog: CatalogType = {
      Hello: {
        translation: "Hallo",
        extra: { flags: ["myTag"] },
      },
    }

    const nextCatalog: ExtractedCatalogType = {
      Hello: {
        message: "Hello",
        origin: [["src/app.ts", 1]],
        placeholders: {},
        comments: [],
      },
    }

    const result = mergeCatalog(prevCatalog, nextCatalog, false, {})
    expect(result["Hello"]).toMatchInlineSnapshot(`
      {
        comments: [],
        extra: {
          flags: [
            myTag,
          ],
        },
        message: Hello,
        origin: [
          [
            src/app.ts,
            1,
          ],
        ],
        placeholders: {},
        translation: Hallo,
      }
    `)
  })

  describe("key order", () => {
    // key order is what a formatter writes out, so it is what shows up in the
    // catalog diff
    const serializedKeys = (entry: unknown) =>
      Object.keys(JSON.parse(JSON.stringify(entry)))

    it("should add translation as the last key of a new message", () => {
      const result = mergeCatalog(
        undefined,
        nextCatalog,
        false,
        defaultMergeOptions,
      )

      expect(serializedKeys(result["custom.id"]).at(-1)).toBe("translation")
      expect(
        serializedKeys(result["Message with <0>auto-generated</0> ID"]).at(-1),
      ).toBe("translation")
    })

    it("should keep the key order of a message stable between extract runs", () => {
      // first extract, both messages are new
      const firstRun = mergeCatalog(
        undefined,
        nextCatalog,
        false,
        defaultMergeOptions,
      )
      // second extract, the very same messages are merged from the catalog
      const secondRun = mergeCatalog(
        firstRun,
        nextCatalog,
        false,
        defaultMergeOptions,
      )

      expect(JSON.stringify(secondRun, null, 2)).toEqual(
        JSON.stringify(firstRun, null, 2),
      )
    })
  })
})

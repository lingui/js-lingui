import fs from "fs-extra"
import path from "path"
import mockFs from "mock-fs"
import { mockConsole, mockConfig } from "@lingui/jest-mocks"

import {
  MakeOptions,
  getCatalogs,
  getCatalogForFile,
  Catalog,
  cleanObsolete,
  MergeOptions,
  order,
} from "./catalog"
import { createCompiledCatalog} from "./compile"

import { copyFixture } from "../tests"
import { ExtractedMessageType, MessageType } from "./types"

const defaultMakeOptions: MakeOptions = {
  verbose: false,
  clean: false,
  overwrite: false,
  prevFormat: null,
  orderBy: "messageId",
}

const defaultMergeOptions: MergeOptions = {
  overwrite: false,
}

function makePrevMessage(message = {}): MessageType {
  return {
    translation: "",
    ...makeNextMessage(message),
  }
}

function makeNextMessage(message = {}): ExtractedMessageType {
  return {
    origin: [["catalog.test.ts", 1]],
    obsolete: false,
    ...message,
  }
}

const fixture = (...dirs) =>
  path.resolve(__dirname, path.join("fixtures", ...dirs))

describe("Catalog", function () {
  afterEach(() => {
    mockFs.restore()
  })

  describe("make", function () {
    it("should collect and write catalogs", function () {
      const localeDir = copyFixture(fixture("locales", "initial"))
      const catalog = new Catalog(
        {
          name: "messages",
          path: path.join(localeDir, "{locale}", "messages"),
          include: [fixture("collect")],
          exclude: [],
        },
        mockConfig({
          locales: ["en", "cs"],
        })
      )

      // Everything should be empty
      expect(catalog.readAll()).toMatchSnapshot()

      catalog.make(defaultMakeOptions)
      expect(catalog.readAll()).toMatchSnapshot()
    })

    it("should merge with existing catalogs", function () {
      const localeDir = copyFixture(fixture("locales", "existing"))
      const catalog = new Catalog(
        {
          name: "messages",
          path: path.join(localeDir, "{locale}"),
          include: [fixture("collect")],
          exclude: [],
        },
        mockConfig({
          locales: ["en", "cs"],
        })
      )

      // Everything should be empty
      expect(catalog.readAll()).toMatchSnapshot()

      catalog.make(defaultMakeOptions)
      expect(catalog.readAll()).toMatchSnapshot()
    })
  })

  describe("collect", function () {
    it("should extract messages from source files", function () {
      const catalog = new Catalog(
        {
          name: "messages",
          path: "locales/{locale}",
          include: [fixture("collect")],
          exclude: [],
        },
        mockConfig()
      )

      const messages = catalog.collect(defaultMakeOptions)
      expect(messages).toMatchSnapshot()
    })

    it("should handle errors", function () {
      const catalog = new Catalog(
        {
          name: "messages",
          path: "locales/{locale}",
          include: [fixture("collect-invalid")],
          exclude: [],
        },
        mockConfig()
      )

      mockConsole((console) => {
        const messages = catalog.collect(defaultMakeOptions)
        expect(console.error).toBeCalledWith(
          expect.stringContaining(`Cannot process file`)
        )
        expect(messages).toMatchSnapshot()
      })
    })
  })

  describe("merge", function () {
    /*
    catalog.merge(prevCatalogs, nextCatalog, options)

    prevCatalogs - map of message catalogs in all available languages with translations
    nextCatalog - language-agnostic catalog with collected messages

    Note: if a catalog in prevCatalogs is null it means the language is available, but
    no previous catalog was generated (usually first run).

    Orthogonal use-cases
    --------------------

    Message IDs:
    - auto-generated IDs: message is used as a key, `defaults` is not set
    - custom IDs: message is used as `defaults`, custom ID as a key

    Source locale (defined by `sourceLocale` in config):
    - catalog for `sourceLocale`: initially, `translation` is prefilled with `defaults`
      (for custom IDs) or `key` (for auto-generated IDs)
    - all other languages: translation is kept empty
    */

    const makeCatalog = (config = {}) =>
      new Catalog(
        {
          name: "messages",
          path: "{locale}/messages",
          include: [],
          exclude: [],
        },
        mockConfig(config)
      )

    it("should initialize catalog", function () {
      const prevCatalogs = { en: null, cs: null }
      const nextCatalog = {
        "custom.id": makeNextMessage({
          message: "Message with custom ID",
        }),
        "Message with <0>auto-generated</0> ID": makeNextMessage(),
      }

      expect(
        makeCatalog({ sourceLocale: "en" }).merge(
          prevCatalogs,
          nextCatalog,
          defaultMergeOptions
        )
      ).toEqual({
        // catalog for sourceLocale - translation is prefilled
        en: {
          "custom.id": expect.objectContaining({
            message: "Message with custom ID",
            translation: "Message with custom ID",
          }),
          "Message with <0>auto-generated</0> ID": expect.objectContaining({
            translation: "Message with <0>auto-generated</0> ID",
          }),
        },
        // catalog for other than sourceLocale - translation is empty
        cs: {
          "custom.id": expect.objectContaining({
            message: "Message with custom ID",
            translation: "",
          }),
          "Message with <0>auto-generated</0> ID": expect.objectContaining({
            translation: "",
          }),
        },
      })
    })

    it("should merge translations from existing catalogs", function () {
      const prevCatalogs = {
        en: {
          "custom.id": makePrevMessage({
            message: "Message with custom ID",
            translation: "Message with custom ID",
          }),
          "Message with <0>auto-generated</0> ID": makePrevMessage({
            translation: "Message with <0>auto-generated</0> ID",
          }),
        },
        cs: {
          "custom.id": makePrevMessage({
            message: "Message with custom ID",
            translation: "Translation of message with custom ID",
          }),
          "Message with <0>auto-generated</0> ID": makePrevMessage({
            translation: "Translation of message with auto-generated ID",
          }),
        },
      }

      const nextCatalog = {
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
        makeCatalog({ sourceLocale: "en" }).merge(
          prevCatalogs,
          nextCatalog,
          defaultMergeOptions
        )
      ).toEqual({
        en: {
          "custom.id": expect.objectContaining({
            message: "Message with custom ID, possibly changed",
            translation: "Message with custom ID, possibly changed",
          }),
          "new.id": expect.objectContaining({
            message: "Completely new message",
            translation: "Completely new message",
          }),
          "Message with <0>auto-generated</0> ID": expect.objectContaining({
            translation: "Message with <0>auto-generated</0> ID",
          }),
          "New message": expect.objectContaining({
            translation: "New message",
          }),
        },
        cs: {
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
        },
      })
    })

    it("should force overwrite of defaults", function () {
      const prevCatalogs = {
        en: {
          "custom.id": makePrevMessage({
            message: "",
            translation: "Message with custom ID",
          }),
        },
        cs: {
          "custom.id": makePrevMessage({
            message: "",
            translation: "Translation of message with custom ID",
          }),
        },
      }

      const nextCatalog = {
        "custom.id": makeNextMessage({
          message: "Message with custom ID, possibly changed",
        }),
      }

      // Without `overwrite`:
      // The translation of `custom.id` message for `sourceLocale` is kept intact
      expect(
        makeCatalog({ sourceLocale: "en" }).merge(
          prevCatalogs,
          nextCatalog,
          defaultMergeOptions
        )
      ).toEqual({
        en: {
          "custom.id": expect.objectContaining({
            message: "Message with custom ID, possibly changed",
            translation: "Message with custom ID",
          }),
        },
        cs: {
          "custom.id": expect.objectContaining({
            message: "Message with custom ID, possibly changed",
            translation: "Translation of message with custom ID",
          }),
        },
      })

      // With `overwrite`
      // The translation of `custom.id` message for `sourceLocale` is changed
      expect(
        makeCatalog({ sourceLocale: "en" }).merge(prevCatalogs, nextCatalog, {
          overwrite: true,
        })
      ).toEqual({
        en: {
          "custom.id": expect.objectContaining({
            message: "Message with custom ID, possibly changed",
            translation: "Message with custom ID, possibly changed",
          }),
        },
        cs: {
          "custom.id": expect.objectContaining({
            message: "Message with custom ID, possibly changed",
            translation: "Translation of message with custom ID",
          }),
        },
      })
    })

    it("should mark obsolete messages", function () {
      const prevCatalogs = {
        en: {
          "msg.hello": makePrevMessage({
            translation: "Hello World",
          }),
        },
      }
      const nextCatalog = {}
      expect(
        makeCatalog().merge(prevCatalogs, nextCatalog, defaultMergeOptions)
      ).toEqual({
        en: {
          "msg.hello": expect.objectContaining({
            translation: "Hello World",
            obsolete: true,
          }),
        },
      })
    })
  })

  describe("read", function () {
    it("should return null if file does not exist", function () {
      // mock empty filesystem
      mockFs()

      const catalog = new Catalog(
        {
          name: "messages",
          path: "locales/{locale}",
          include: [],
          exclude: [],
        },
        mockConfig()
      )

      const messages = catalog.read("en")
      expect(messages).toBeNull()
    })

    it("should read file in given format", function () {
      mockFs({
        en: {
          "messages.po": fs.readFileSync(
            path.resolve(__dirname, "formats/fixtures/messages.po")
          ),
        },
      })
      const catalog = new Catalog(
        {
          name: "messages",
          path: "{locale}/messages",
          include: [],
        },
        mockConfig()
      )

      const messages = catalog.read("en")

      mockFs.restore()
      expect(messages).toMatchSnapshot()
    })

    it("should read file in previous format", function () {
      mockFs({
        en: {
          "messages.json": fs.readFileSync(
            path.resolve(__dirname, "formats/fixtures/messages.json")
          ),
        },
      })
      const catalog = new Catalog(
        {
          name: "messages",
          path: "{locale}/messages",
          include: [],
        },
        mockConfig({ prevFormat: "minimal" })
      )

      const messages = catalog.read("en")

      mockFs.restore()
      expect(messages).toMatchSnapshot()
    })
  })

  describe("readAll", function () {
    it("should read existing catalogs for all locales", function () {
      const catalog = new Catalog(
        {
          name: "messages",
          path: path.resolve(
            __dirname,
            path.join("fixtures", "readAll", "{locale}", "messages")
          ),
          include: [],
        },
        mockConfig({
          locales: ["en", "cs"],
        })
      )

      const messages = catalog.readAll()
      expect(messages).toMatchSnapshot()
    })
  })

  /**
   * Convert JSON format to PO and then back to JSON.
   * - Compare that original and converted JSON file are identical
   * - Check the content of PO file
   */
  it.skip("should convert catalog format", function () {
    mockFs({
      en: {
        "messages.json": fs.readFileSync(
          path.resolve(__dirname, "formats/fixtures/messages.json")
        ),
        "messages.po": mockFs.file(),
      },
    })

    const fileContent = (format) =>
      fs
        .readFileSync("./en/messages." + (format === "po" ? "po" : "json"))
        .toString()
        .trim()

    const catalogConfig = {
      name: "messages",
      path: "{locale}/messages",
      include: [],
    }

    const originalJson = fileContent("json")
    const po2json = new Catalog(
      catalogConfig,
      mockConfig({
        format: "po",
        prevFormat: "minimal",
      })
    )
    po2json.write("en", po2json.read("en"))
    const convertedPo = fileContent("po")

    const json2po = new Catalog(
      catalogConfig,
      mockConfig({
        format: "minimal",
        prevFormat: "po",
        localeDir: ".",
      })
    )
    json2po.write("en", json2po.read("en"))
    const convertedJson = fileContent("json")

    mockFs.restore()
    expect(originalJson).toEqual(convertedJson)
    expect(convertedPo).toMatchSnapshot()
  })
})

describe("getCatalogs", function () {
  afterEach(() => {
    mockFs.restore()
  })

  it("should get single catalog if catalogPath doesn't include {name} pattern", function () {
    const config = mockConfig({
      catalogs: [
        {
          path: "./src/locales/{locale}",
          include: "./src/",
        },
      ],
    })
    expect(getCatalogs(config)).toEqual([
      new Catalog(
        {
          name: null,
          path: "src/locales/{locale}",
          include: ["src/"],
          exclude: [],
        },
        config
      ),
    ])
  })

  it("should have catalog name and ignore patterns", function () {
    const config = mockConfig({
      catalogs: [
        {
          path: "src/locales/{locale}/all",
          include: ["src/", "/absolute/path/"],
          exclude: ["node_modules/"],
        },
      ],
    })
    expect(getCatalogs(config)).toEqual([
      new Catalog(
        {
          name: "all",
          path: "src/locales/{locale}/all",
          include: ["src/", "/absolute/path/"],
          exclude: ["node_modules/"],
        },
        config
      ),
    ])
  })

  it("should expand {name} for matching directories", function () {
    mockFs({
      componentA: {
        "index.js": mockFs.file(),
      },
      componentB: {
        "index.js": mockFs.file(),
      },
    })

    const config = mockConfig({
      catalogs: [
        {
          path: "{name}/locales/{locale}",
          include: ["./{name}/"],
        },
      ],
    })
    expect(getCatalogs(config)).toEqual([
      new Catalog(
        {
          name: "componentA",
          path: "componentA/locales/{locale}",
          include: ["componentA/"],
          exclude: [],
        },
        config
      ),
      new Catalog(
        {
          name: "componentB",
          path: "componentB/locales/{locale}",
          include: ["componentB/"],
          exclude: [],
        },
        config
      ),
    ])
  })

  it("shouldn't expand {name} for ignored directories", function () {
    mockFs({
      componentA: {
        "index.js": mockFs.file(),
      },
      componentB: {
        "index.js": mockFs.file(),
      },
    })

    const config = mockConfig({
      catalogs: [
        {
          path: "./{name}/locales/{locale}",
          include: ["./{name}/"],
          exclude: ["componentB/"],
        },
      ],
    })
    expect(getCatalogs(config)).toEqual([
      new Catalog(
        {
          name: "componentA",
          path: "componentA/locales/{locale}",
          include: ["componentA/"],
          exclude: ["componentB/"],
        },
        config
      ),
    ])
  })

  it("should warn if catalogPath is a directory", function () {
    expect(() =>
      getCatalogs(
        mockConfig({
          catalogs: [
            {
              path: "./locales/{locale}/",
              include: ["."],
            },
          ],
        })
      )
    ).toThrowErrorMatchingSnapshot()

    // Use valus from config in error message
    expect(() =>
      getCatalogs(
        mockConfig({
          locales: ["cs"],
          format: "minimal",
          catalogs: [
            {
              path: "./locales/{locale}/",
              include: ["."],
            },
          ],
        })
      )
    ).toThrowErrorMatchingSnapshot()
  })

  it("should warn about missing {name} pattern in catalog path", function () {
    expect(() =>
      getCatalogs(
        mockConfig({
          catalogs: [
            {
              path: "./locales/{locale}",
              include: ["./{name}/"],
            },
          ],
        })
      )
    ).toThrowErrorMatchingSnapshot()
  })
})

describe("getCatalogForFile", function () {
  it("should return null if catalog cannot be found", function () {
    const catalogs = [
      new Catalog(
        {
          name: null,
          path: "./src/locales/{locale}",
          include: ["./src/"],
        },
        mockConfig()
      ),
    ]

    expect(getCatalogForFile("./xyz/en.po", catalogs)).toBeNull()
  })

  it("should return matching catalog and locale", function () {
    const catalog = new Catalog(
      {
        name: null,
        path: "./src/locales/{locale}",
        include: ["./src/"],
      },
      mockConfig({ format: "po" })
    )
    const catalogs = [catalog]

    expect(getCatalogForFile("./src/locales/en.po", catalogs)).toEqual({
      locale: "en",
      catalog,
    })
  })

  it("should work with Windows path delimiters", function () {
    const catalog = new Catalog(
      {
        name: null,
        path: ".\\src\\locales\\{locale}",
        include: ["./src/"],
      },
      mockConfig({ format: "po" })
    )
    const catalogs = [catalog]

    expect(getCatalogForFile("src\\locales\\en.po", catalogs)).toEqual({
      locale: "en",
      catalog,
    })
  })
})

describe("cleanObsolete", function () {
  it("should remove obsolete messages from catalog", function () {
    const catalog = {
      Label: makeNextMessage({
        translation: "Label",
      }),
      PreviousLabel: makeNextMessage({
        obsolete: true,
      }),
    }

    expect(cleanObsolete(catalog)).toMatchSnapshot()
  })
})

describe("order", function () {
  it("should order messages alphabetically", function () {
    const catalog = {
      LabelB: makeNextMessage({
        translation: "B",
      }),
      LabelA: makeNextMessage({
        translation: "A",
      }),
      LabelD: makeNextMessage({
        translation: "D",
      }),
      LabelC: makeNextMessage({
        translation: "C",
      }),
    }

    const orderedCatalogs = order("messageId")(catalog)

    // Test that the message content is the same as before
    expect(orderedCatalogs).toMatchSnapshot()

    // Jest snapshot order the keys automatically, so test that the key order explicitly
    expect(Object.keys(orderedCatalogs)).toMatchSnapshot()
  })

  it("should order messages by origin", function () {
    const catalog = {
      LabelB: makeNextMessage({
        translation: "B",
        origin: [
          ["file2.js", 2],
          ["file1.js", 2],
        ],
      }),
      LabelA: makeNextMessage({
        translation: "A",
        origin: [["file2.js", 3]],
      }),
      LabelD: makeNextMessage({
        translation: "D",
        origin: [["file2.js", 100]],
      }),
      LabelC: makeNextMessage({
        translation: "C",
        origin: [["file1.js", 1]],
      }),
    }

    const orderedCatalogs = order("origin")(catalog)

    // Test that the message content is the same as before
    expect(orderedCatalogs).toMatchSnapshot()

    // Jest snapshot order the keys automatically, so test that the key order explicitly
    expect(Object.keys(orderedCatalogs)).toMatchSnapshot()
  })
})

describe("writeCompiled", function () {
  it("saves ES modules to .mjs files", function () {
    const localeDir = copyFixture(fixture("locales", "initial"))
    const catalog = new Catalog(
      {
        name: "messages",
        path: path.join(localeDir, "{locale}", "messages"),
        include: [],
        exclude: [],
      },
      mockConfig()
    )

    const namespace = "es"
    const compiledCatalog = createCompiledCatalog("en", {}, { namespace })
    // Test that the file extension of the compiled catalog is `.mjs`
    expect(catalog.writeCompiled("en", compiledCatalog, namespace)).toMatch(/\.mjs$/)
  })

  it("saves anything else than ES modules to .js files", function () {
    const localeDir = copyFixture(fixture("locales", "initial"))
    const catalog = new Catalog(
      {
        name: "messages",
        path: path.join(localeDir, "{locale}", "messages"),
        include: [],
        exclude: [],
      },
      mockConfig()
    )

    let compiledCatalog = createCompiledCatalog("en", {}, {})
    // Test that the file extension of the compiled catalog is `.js`
    expect(catalog.writeCompiled("en", compiledCatalog)).toMatch(/\.js$/)

    compiledCatalog = createCompiledCatalog("en", {}, { namespace: "cjs" })
    expect(catalog.writeCompiled("en", compiledCatalog)).toMatch(/\.js$/)

    compiledCatalog = createCompiledCatalog("en", {}, { namespace: "window.test" })
    expect(catalog.writeCompiled("en", compiledCatalog)).toMatch(/\.js$/)

    compiledCatalog = createCompiledCatalog("en", {}, { namespace: "global.test" })
    expect(catalog.writeCompiled("en", compiledCatalog)).toMatch(/\.js$/)

  })
})

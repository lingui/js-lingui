import fs from "fs-extra"
import path from "path"
import mockFs from "mock-fs"
import { mockConsole, mockConfig } from "@lingui/jest-mocks"

import {
  getCatalogs,
  getCatalogForFile,
  Catalog,
  orderByMessageId,
  cleanObsolete
} from "./catalog"
import { copyFixture } from "../tests"

const fixture = (...dirs) =>
  path.resolve(__dirname, path.join("fixtures", ...dirs))
describe("Catalog", function() {
  afterEach(() => {
    mockFs.restore()
  })

  describe("make", function() {
    it("should collect and write catalogs", function() {
      const localeDir = copyFixture(fixture("locales", "initial"))
      const catalog = new Catalog(
        {
          name: "messages",
          path: path.join(localeDir, "{locale}", "messages"),
          include: [fixture("collect")],
          exclude: []
        },
        mockConfig({
          locales: ["en", "cs"]
        })
      )

      // Everything should be empty
      expect(catalog.readAll()).toMatchSnapshot()

      catalog.make()
      expect(catalog.readAll()).toMatchSnapshot()
    })

    it("should merge with existing catalogs", function() {
      const localeDir = copyFixture(fixture("locales", "existing"))
      const catalog = new Catalog(
        {
          name: "messages",
          path: path.join(localeDir, "{locale}"),
          include: [fixture("collect")],
          exclude: []
        },
        mockConfig({
          locales: ["en", "cs"]
        })
      )

      // Everything should be empty
      expect(catalog.readAll()).toMatchSnapshot()

      catalog.make()
      expect(catalog.readAll()).toMatchSnapshot()
    })
  })

  describe("collect", function() {
    it("should extract messages from source files", function() {
      const catalog = new Catalog(
        {
          name: "messages",
          path: "locales/{locale}",
          include: [fixture("collect")],
          exclude: []
        },
        mockConfig()
      )

      const messages = catalog.collect()
      expect(messages).toMatchSnapshot()
    })

    it("should handle errors", function() {
      const catalog = new Catalog(
        {
          name: "messages",
          path: "locales/{locale}",
          include: [fixture("collect-invalid")],
          exclude: []
        },
        mockConfig()
      )

      mockConsole(console => {
        const messages = catalog.collect()
        expect(console.error).toBeCalledWith(
          expect.stringContaining(`Cannot process file`)
        )
        expect(messages).toMatchSnapshot()
      })
    })
  })

  describe("merge", function() {
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
          exclude: []
        },
        mockConfig(config)
      )

    it("should initialize catalog", function() {
      const prevCatalogs = { en: null, cs: null }
      const nextCatalog = {
        "custom.id": {
          defaults: "Message with custom ID"
        },
        "Message with <0>auto-generated</0> ID": {}
      }

      expect(
        makeCatalog({ sourceLocale: "en" }).merge(prevCatalogs, nextCatalog)
      ).toEqual({
        // catalog for sourceLocale - translation is prefilled
        en: {
          "custom.id": {
            defaults: "Message with custom ID",
            translation: "Message with custom ID"
          },
          "Message with <0>auto-generated</0> ID": {
            translation: "Message with <0>auto-generated</0> ID"
          }
        },
        // catalog for other than sourceLocale - translation is empty
        cs: {
          "custom.id": {
            defaults: "Message with custom ID",
            translation: ""
          },
          "Message with <0>auto-generated</0> ID": {
            translation: ""
          }
        }
      })
    })

    it("should merge translations from existing catalogs", function() {
      const prevCatalogs = {
        en: {
          "custom.id": {
            defaults: "Message with custom ID",
            translation: "Message with custom ID"
          },
          "Message with <0>auto-generated</0> ID": {
            translation: "Message with <0>auto-generated</0> ID"
          }
        },
        cs: {
          "custom.id": {
            defaults: "Message with custom ID",
            translation: "Translation of message with custom ID"
          },
          "Message with <0>auto-generated</0> ID": {
            translation: "Translation of message with auto-generated ID"
          }
        }
      }

      const nextCatalog = {
        "custom.id": {
          defaults: "Message with custom ID, possibly changed"
        },
        "new.id": {
          defaults: "Completely new message"
        },
        "Message with <0>auto-generated</0> ID": {},
        "New message": {}
      }

      expect(
        makeCatalog({ sourceLocale: "en" }).merge(prevCatalogs, nextCatalog)
      ).toEqual({
        en: {
          "custom.id": {
            defaults: "Message with custom ID, possibly changed",
            translation: "Message with custom ID, possibly changed"
          },
          "new.id": {
            defaults: "Completely new message",
            translation: "Completely new message"
          },
          "Message with <0>auto-generated</0> ID": {
            translation: "Message with <0>auto-generated</0> ID"
          },
          "New message": {
            translation: "New message"
          }
        },
        cs: {
          "custom.id": {
            defaults: "Message with custom ID, possibly changed",
            translation: "Translation of message with custom ID"
          },
          "new.id": {
            defaults: "Completely new message",
            translation: ""
          },
          "Message with <0>auto-generated</0> ID": {
            translation: "Translation of message with auto-generated ID"
          },
          "New message": {
            translation: ""
          }
        }
      })
    })

    it("should force overwrite of defaults", function() {
      const prevCatalogs = {
        en: {
          "custom.id": {
            defaults: "",
            translation: "Message with custom ID"
          }
        },
        cs: {
          "custom.id": {
            defaults: "",
            translation: "Translation of message with custom ID"
          }
        }
      }

      const nextCatalog = {
        "custom.id": {
          defaults: "Message with custom ID, possibly changed"
        }
      }

      // Without `overwrite`:
      // The translation of `custom.id` message for `sourceLocale` is kept intact
      expect(
        makeCatalog({ sourceLocale: "en" }).merge(prevCatalogs, nextCatalog)
      ).toEqual({
        en: {
          "custom.id": {
            defaults: "Message with custom ID, possibly changed",
            translation: "Message with custom ID"
          }
        },
        cs: {
          "custom.id": {
            defaults: "Message with custom ID, possibly changed",
            translation: "Translation of message with custom ID"
          }
        }
      })

      // With `overwrite`
      // The translation of `custom.id` message for `sourceLocale` is changed
      expect(
        makeCatalog({ sourceLocale: "en" }).merge(prevCatalogs, nextCatalog, {
          overwrite: true
        })
      ).toEqual({
        en: {
          "custom.id": {
            defaults: "Message with custom ID, possibly changed",
            translation: "Message with custom ID, possibly changed"
          }
        },
        cs: {
          "custom.id": {
            defaults: "Message with custom ID, possibly changed",
            translation: "Translation of message with custom ID"
          }
        }
      })
    })

    it("should mark obsolete messages", function() {
      const prevCatalogs = {
        en: {
          "msg.hello": {
            translation: "Hello World"
          }
        }
      }
      const nextCatalog = {}
      expect(makeCatalog().merge(prevCatalogs, nextCatalog)).toEqual({
        en: {
          "msg.hello": {
            translation: "Hello World",
            obsolete: true
          }
        }
      })
    })
  })

  describe("read", function() {
    it("should return null if file does not exist", function() {
      // mock empty filesystem
      mockFs()

      const catalog = new Catalog(
        {
          name: "messages",
          path: "locales/{locale}",
          include: [],
          exclude: []
        },
        mockConfig()
      )

      const messages = catalog.read("en")
      expect(messages).toBeNull()
    })

    it("should read file in given format", function() {
      mockFs({
        en: {
          "messages.po": fs.readFileSync(
            path.resolve(__dirname, "formats/fixtures/messages.po")
          )
        }
      })
      const catalog = new Catalog(
        {
          name: "messages",
          path: "{locale}/messages",
          include: []
        },
        mockConfig()
      )

      const messages = catalog.read("en")

      mockFs.restore()
      expect(messages).toMatchSnapshot()
    })

    it("should read file in previous format", function() {
      mockFs({
        en: {
          "messages.json": fs.readFileSync(
            path.resolve(__dirname, "formats/fixtures/messages.json")
          )
        }
      })
      const catalog = new Catalog(
        {
          name: "messages",
          path: "{locale}/messages",
          include: []
        },
        mockConfig({ prevFormat: "minimal" })
      )

      const messages = catalog.read("en")

      mockFs.restore()
      expect(messages).toMatchSnapshot()
    })
  })

  describe("readAll", function() {
    it("should read existing catalogs for all locales", function() {
      const catalog = new Catalog(
        {
          name: "messages",
          path: path.resolve(
            __dirname,
            path.join("fixtures", "readAll", "{locale}", "messages")
          ),
          include: []
        },
        mockConfig({
          locales: ["en", "cs"]
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
  it("should convert catalog format", function() {
    mockFs({
      en: {
        "messages.json": fs.readFileSync(
          path.resolve(__dirname, "formats/fixtures/messages.json")
        ),
        "messages.po": mockFs.file()
      }
    })

    const fileContent = format =>
      fs
        .readFileSync("./en/messages." + (format === "po" ? "po" : "json"))
        .toString()
        .trim()

    const catalogConfig = {
      name: "messages",
      path: "{locale}/messages",
      include: []
    }

    const originalJson = fileContent("json")
    const po2json = new Catalog(
      catalogConfig,
      mockConfig({
        format: "po",
        prevFormat: "minimal"
      })
    )
    po2json.write("en", po2json.read("en"))
    const convertedPo = fileContent("po")

    const json2po = new Catalog(
      catalogConfig,
      mockConfig({
        format: "minimal",
        prevFormat: "po",
        localeDir: "."
      })
    )
    json2po.write("en", json2po.read("en"))
    const convertedJson = fileContent("json")

    mockFs.restore()
    expect(originalJson).toEqual(convertedJson)
    expect(convertedPo).toMatchSnapshot()
  })
})

describe("getCatalogs", function() {
  afterEach(() => {
    mockFs.restore()
  })

  it("should get single catalog if catalogPath doesn't include {name} pattern", function() {
    const config = mockConfig({
      catalogs: [
        {
          path: "./src/locales/{locale}",
          include: "./src/"
        }
      ]
    })
    expect(getCatalogs(config)).toEqual([
      new Catalog(
        {
          name: null,
          path: "src/locales/{locale}",
          include: ["src/"],
          exclude: []
        },
        config
      )
    ])
  })

  it("should have catalog name and ignore patterns", function() {
    const config = mockConfig({
      catalogs: [
        {
          path: "src/locales/{locale}/all",
          include: ["src/", "/absolute/path/"],
          exclude: ["node_modules/"]
        }
      ]
    })
    expect(getCatalogs(config)).toEqual([
      new Catalog(
        {
          name: "all",
          path: "src/locales/{locale}/all",
          include: ["src/", "/absolute/path/"],
          exclude: ["node_modules/"]
        },
        config
      )
    ])
  })

  it("should expand {name} for matching directories", function() {
    mockFs({
      componentA: {
        "index.js": mockFs.file()
      },
      componentB: {
        "index.js": mockFs.file()
      }
    })

    const config = mockConfig({
      catalogs: [
        {
          path: "{name}/locales/{locale}",
          include: ["./{name}/"]
        }
      ]
    })
    expect(getCatalogs(config)).toEqual([
      new Catalog(
        {
          name: "componentA",
          path: "componentA/locales/{locale}",
          include: ["componentA/"],
          exclude: []
        },
        config
      ),
      new Catalog(
        {
          name: "componentB",
          path: "componentB/locales/{locale}",
          include: ["componentB/"],
          exclude: []
        },
        config
      )
    ])
  })

  it("shouldn't expand {name} for ignored directories", function() {
    mockFs({
      componentA: {
        "index.js": mockFs.file()
      },
      componentB: {
        "index.js": mockFs.file()
      }
    })

    const config = mockConfig({
      catalogs: [
        {
          path: "./{name}/locales/{locale}",
          include: ["./{name}/"],
          exclude: ["componentB/"]
        }
      ]
    })
    expect(getCatalogs(config)).toEqual([
      new Catalog(
        {
          name: "componentA",
          path: "componentA/locales/{locale}",
          include: ["componentA/"],
          exclude: ["componentB/"]
        },
        config
      )
    ])
  })

  it("should warn if catalogPath is a directory", function() {
    expect(() =>
      getCatalogs(
        mockConfig({
          catalogs: [
            {
              path: "./locales/{locale}/",
              include: ["."]
            }
          ]
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
              include: ["."]
            }
          ]
        })
      )
    ).toThrowErrorMatchingSnapshot()
  })

  it("should warn about missing {name} pattern in catalog path", function() {
    expect(() =>
      getCatalogs(
        mockConfig({
          catalogs: [
            {
              path: "./locales/{locale}",
              include: ["./{name}/"]
            }
          ]
        })
      )
    ).toThrowErrorMatchingSnapshot()
  })
})

describe("getCatalogForFile", function() {
  it("should return null if catalog cannot be found", function() {
    const catalogs = [
      new Catalog(
        {
          name: null,
          path: "./src/locales/{locale}",
          include: ["./src/"]
        },
        mockConfig()
      )
    ]

    expect(getCatalogForFile("./xyz/en.po", catalogs)).toBeNull()
  })

  it("should return matching catalog and locale", function() {
    const catalog = new Catalog(
      {
        name: null,
        path: "./src/locales/{locale}",
        include: ["./src/"]
      },
      mockConfig({ format: "po" })
    )
    const catalogs = [catalog]

    expect(getCatalogForFile("./src/locales/en.po", catalogs)).toEqual({
      locale: "en",
      catalog
    })
  })
})

describe("cleanObsolete", function() {
  it("should remove obsolete messages from catalog", function() {
    const catalog = {
      Label: {
        translation: "Label"
      },
      PreviousLabel: {
        obsolete: true
      }
    }

    expect(cleanObsolete(catalog)).toMatchSnapshot()
  })
})

describe("orderByMessageId", function() {
  it("should order messages by ID alphabetically", function() {
    const catalog = {
      LabelB: {
        translation: "B"
      },
      LabelA: {
        translation: "A"
      },
      LabelD: {
        translation: "D"
      },
      LabelC: {
        translation: "C"
      }
    }

    const orderedCatalogs = orderByMessageId(catalog)

    // Test that the message content is the same as before
    expect(orderedCatalogs).toEqual(catalog)

    // Jest snapshot order the keys automatically, so test that the key order explicitly
    expect(Object.keys(orderedCatalogs)).toMatchSnapshot()
  })
})

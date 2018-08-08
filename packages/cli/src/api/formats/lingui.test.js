import path from "path"
import tmp from "tmp"
import plugin from "./lingui"

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
function escapeRegExp(string) {
  // $& means the whole matched string
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

describe("Catalog formats - lingui", function() {
  const createConfig = config => ({
    ...config,
    localeDir: tmp.dirSync({ unsafeCleanup: true }).name
  })

  describe("addLocale", function() {
    it("should add locale", function() {
      const config = createConfig()

      // First run, create a directory with an empty message catalog
      expect(plugin(config).addLocale("en")).toEqual([
        true,
        expect.stringMatching(
          escapeRegExp(path.join("en", "messages.json")) + "$"
        )
      ])

      // Second run, don't do anything
      expect(plugin(config).addLocale("en")).toEqual([
        false,
        expect.stringMatching(
          escapeRegExp(path.join("en", "messages.json")) + "$"
        )
      ])
    })

    it("shouldn't add invalid locale", function() {
      expect(plugin(createConfig()).addLocale("xyz")).toEqual([false, null])
    })
  })

  describe("getLocale", function() {
    it("should get locale for given filename", function() {
      const config = createConfig()
      expect(
        plugin(config).getLocale(path.join("en", "messages.json"))
      ).toEqual("en")
      expect(
        plugin(config).getLocale(path.join("en_US", "messages.json"))
      ).toEqual("en_US")
      expect(
        plugin(config).getLocale(path.join("en-US", "messages.json"))
      ).toEqual("en-US")
    })

    it("should return null for invalid locales", function() {
      const config = createConfig()
      expect(plugin(config).getLocale("messages.json")).toBeNull()
    })
  })

  describe("merge", function() {
    /*
    plugin.merge(prevCatalogs, nextCatalog)

    prevCatalogs - map of message catalogs in all available languages with translations
    nextCatalog - language-agnostic catalog with actual messages extracted from source

    Note: if a catalog in prevCatalogs is null it means the language is availabe, but
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

    it("should initialize catalog", function() {
      const prevCatalogs = { en: null, cs: null }
      const nextCatalog = {
        "custom.id": {
          defaults: "Message with custom ID"
        },
        "Message with <0>auto-generated</0> ID": {}
      }

      expect(
        plugin(createConfig({ sourceLocale: "en" })).merge(
          prevCatalogs,
          nextCatalog
        )
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
        plugin(createConfig({ sourceLocale: "en" })).merge(
          prevCatalogs,
          nextCatalog
        )
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
        plugin(createConfig({ sourceLocale: "en" })).merge(
          prevCatalogs,
          nextCatalog
        )
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
        plugin(createConfig({ sourceLocale: "en" })).merge(
          prevCatalogs,
          nextCatalog,
          { overwrite: true }
        )
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
      expect(plugin(createConfig()).merge(prevCatalogs, nextCatalog)).toEqual({
        en: {
          "msg.hello": {
            translation: "Hello World",
            obsolete: true
          }
        }
      })
    })
  })

  it("readAll - should read existing catalogs for all locales", function() {
    const mockedPlugin = plugin(createConfig())
    mockedPlugin.getLocales = jest.fn(() => ["en", "cs"])
    mockedPlugin.read = jest.fn(locale => ({
      "msg.header": { translation: `Message in locale ${locale}` }
    }))

    expect(mockedPlugin.readAll()).toEqual({
      en: {
        "msg.header": {
          translation: "Message in locale en"
        }
      },
      cs: {
        "msg.header": {
          translation: "Message in locale cs"
        }
      }
    })
  })
})

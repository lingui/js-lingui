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
      expect(plugin(config).getLocale("en/messages.json")).toEqual("en")
      expect(plugin(config).getLocale("en_US/messages.json")).toEqual("en_US")
    })

    it("should return null for invalid locales", function() {
      const config = createConfig()
      expect(plugin(config).getLocale("conf.d/messages.json")).toBeNull()
      expect(plugin(config).getLocale("messages.json")).toBeNull()
    })
  })

  describe("merge", function() {
    it("should initialize catalog", function() {
      const prevCatalogs = { en: null }
      const nextCatalog = {
        "msg.hello": {
          defaults: "Hello World"
        }
      }
      expect(plugin(createConfig()).merge(prevCatalogs, nextCatalog)).toEqual({
        en: {
          "msg.hello": {
            defaults: "Hello World",
            translation: ""
          }
        }
      })
    })

    it("should merge translations from existing catalogs", function() {
      const prevCatalogs = {
        en: {
          "msg.hello": {
            translation: "Hello World"
          }
        }
      }
      const nextCatalog = {
        "msg.hello": {
          defaults: "Hello World"
        },
        "msg.goodbye": {
          defaults: "Goodbye!"
        }
      }
      expect(plugin(createConfig()).merge(prevCatalogs, nextCatalog)).toEqual({
        en: {
          "msg.hello": {
            translation: "Hello World",
            defaults: "Hello World"
          },
          "msg.goodbye": {
            translation: "",
            defaults: "Goodbye!"
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

    it("should use key as translations for sourceLocale", function() {
      const prevCatalogs = { en: null }
      const nextCatalog = {
        "Hello World": {
          defaults: ""
        }
      }
      expect(
        plugin(createConfig({ sourceLocale: "en" })).merge(
          prevCatalogs,
          nextCatalog
        )
      ).toEqual({
        en: {
          "Hello World": {
            translation: "Hello World",
            defaults: ""
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

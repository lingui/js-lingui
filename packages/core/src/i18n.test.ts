import { setupI18n } from "@lingui/core"
import { mockConsole, mockEnv } from "@lingui/jest-mocks"

describe("I18n", function () {
  describe("I18n.load", () => {
    it("should emit event", () => {
      const i18n = setupI18n()

      const cbChange = jest.fn()
      i18n.on("change", cbChange)
      i18n.load("en", { msg: "Message" })
      expect(cbChange).toBeCalled()
    })

    it("should load catalog and merge with existing", () => {
      const messages = {
        Hello: "Hello",
      }

      const localeData = {
        plurals: jest.fn(),
        code: "en_US",
      }

      const i18n = setupI18n()
      i18n.load("en", { messages, localeData })
      i18n.activate("en")
      expect(i18n.messages).toEqual(messages)
      expect(i18n.localeData).toEqual(localeData)

      // fr catalog shouldn't affect the english one
      i18n.load("fr", { messages: { Hello: "Salut" } })
      expect(i18n.messages).toEqual(messages)
    })

    it("should load multiple catalogs at once", () => {
      const enMessages = {
        Hello: "Hello",
      }
      const frMessages = {
        Hello: "Salut",
      }

      const i18n = setupI18n()
      i18n.load({
        en: {
          localeData: {
            plurals: jest.fn(),
            code: "en_US",
          },
          messages: enMessages,
        },
        fr: {
          localeData: {
            plurals: jest.fn(),
            code: "fr_FR",
          },
          messages: frMessages,
        },
      })

      i18n.activate("en")
      expect(i18n.messages).toEqual(enMessages)

      i18n.activate("fr")
      expect(i18n.messages).toEqual(frMessages)
    })
  })

  describe("I18n.activate", () => {
    it("should emit event", () => {
      const i18n = setupI18n({
        locale: "en",
        catalogs: {
          en: { messages: {} },
        },
      })

      const cbChange = jest.fn()
      i18n.on("change", cbChange)
      i18n.activate("en")
      expect(cbChange).toBeCalled()
    })

    it("should switch active locale", () => {
      const messages = {
        Hello: "Salut",
      }

      const i18n = setupI18n({
        locale: "en",
        catalogs: {
          fr: { messages },
          en: { messages: {} },
        },
      })

      expect(i18n.locale).toEqual("en")
      expect(i18n.messages).toEqual({})

      i18n.activate("fr")
      expect(i18n.locale).toEqual("fr")
      expect(i18n.messages).toEqual(messages)
    })

    it("should throw an error about incorrect locale", () => {
      const i18n = setupI18n()

      mockConsole((console) => {
        i18n.activate("xyz")
        expect(console.warn).toBeCalledWith(
          'Message catalog for locale "xyz" not loaded.'
        )
      })

      mockEnv("production", () => {
        jest.resetModules()
        mockConsole((console) => {
          const { setupI18n } = require("@lingui/core")
          const i18n = setupI18n()
          i18n.activate("xyz")
          expect(console.warn).not.toBeCalled()
        })
      })
    })
  })

  it("._ should format message from catalog", function () {
    const messages = {
      Hello: "Salut",
      "My name is {name}": "Je m'appelle {name}",
    }

    const i18n = setupI18n({
      locale: "fr",
      catalogs: { fr: { messages } },
    })

    expect(i18n._("Hello")).toEqual("Salut")
    expect(i18n._("My name is {name}", { name: "Fred" })).toEqual(
      "Je m'appelle Fred"
    )

    // missing { name }
    expect(i18n._("My name is {name}")).toEqual("Je m'appelle")

    // Untranslated message
    expect(i18n._("Missing message")).toEqual("Missing message")
    expect(i18n._("Missing {name}", { name: "Fred" })).toEqual("Missing Fred")
    expect(
      i18n._(
        "Missing with default",
        { name: "Fred" },
        {
          message: "Missing {name}",
        }
      )
    ).toEqual("Missing Fred")
  })

  it("._ should translate message from variable", function () {
    const messages = {
      Hello: "Salut",
    }

    const i18n = setupI18n({
      locale: "fr",
      catalogs: { fr: { messages } },
    })
    const hello = "Hello"
    expect(i18n._(hello)).toEqual("Salut")
  })

  it("._ allow escaping syntax characters", () => {
    const messages = {
      "My ''name'' is '{name}'": "Mi ''nombre'' es '{name}'",
    }

    const i18n = setupI18n({
      locale: "es",
      catalogs: { es: { messages } },
    })

    expect(i18n._("My ''name'' is '{name}'")).toEqual("Mi 'nombre' es {name}")
  })

  it("._ shouldn't compile messages in production", function () {
    const messages = {
      Hello: "Salut",
      "My name is {name}": "Je m'appelle {name}",
    }

    mockEnv("production", () => {
      const { setupI18n } = require("@lingui/core")
      const i18n = setupI18n({
        locale: "fr",
        catalogs: { fr: { messages } },
      })

      expect(i18n._("My name is {name}", { name: "Fred" })).toEqual(
        "Je m'appelle {name}"
      )
    })
  })

  describe("params.missing - handling missing translations", function () {
    it("._ should return custom string for missing translations", function () {
      const i18n = setupI18n({
        missing: "xxx",
        locale: "en",
        catalogs: { en: { messages: { exists: "exists" } } },
      })
      expect(i18n._("exists")).toEqual("exists")
      expect(i18n._("missing")).toEqual("xxx")
    })

    it("._ should call a function with message ID of missing translation", function () {
      const missing = jest.fn((locale, id) => id.split("").reverse().join(""))
      const i18n = setupI18n({
        locale: "en",
        missing,
      })
      expect(i18n._("missing")).toEqual("gnissim")
      expect(missing).toHaveBeenCalledWith("en", "missing")
    })
  })
})

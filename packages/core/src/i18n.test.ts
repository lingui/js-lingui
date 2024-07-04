import { setupI18n } from "./i18n"
import { mockConsole, mockEnv } from "@lingui/jest-mocks"

describe("I18n", () => {
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

      const i18n = setupI18n()
      expect(i18n.messages).toEqual({})
      i18n.load("en", messages)
      i18n.activate("en")
      expect(i18n.messages).toEqual(messages)

      const extraMessages = {
        World: "World",
      }
      i18n.load("en", extraMessages)
      expect(i18n.messages).toEqual({ ...messages, ...extraMessages })

      // fr catalog shouldn't affect the english one
      i18n.load("fr", { Hello: "Salut" })
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
        en: enMessages,
        fr: frMessages,
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
        messages: {
          en: {},
        },
      })

      const cbChange = jest.fn()
      i18n.on("change", cbChange)
      i18n.activate("en")
      expect(cbChange).toBeCalled()
    })

    it("should activate instantly", () => {
      const i18n = setupI18n({
        messages: {
          en: {
            Hello: "Hello",
          },
          es: {
            Hello: "Hola",
          },
        },
      })

      i18n.activate("en")
      expect(i18n._("Hello")).toEqual("Hello")
      i18n.activate("es")
      expect(i18n._("Hello")).toEqual("Hola")
    })

    it("should switch active locale", () => {
      const messages = {
        Hello: "Salut",
      }

      const i18n = setupI18n({
        locale: "en",
        messages: {
          fr: messages,
          en: {},
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
          'Messages for locale "xyz" not loaded.'
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

  describe("I18n.loadAndActivate", () => {
    it("should set locale and messages", () => {
      const i18n = setupI18n()

      const cbChange = jest.fn()
      i18n.on("change", cbChange)

      i18n.loadAndActivate({
        locale: "en",
        messages: { message: "My Message" },
      })

      expect(i18n.locale).toEqual("en")
      expect(i18n.locales).toBeUndefined()

      expect(cbChange).toBeCalled()
    })

    it("should support locales as array", () => {
      const i18n = setupI18n()

      i18n.loadAndActivate({
        locale: "ar",
        locales: ["en-UK", "ar-AS"],
        messages: { message: "My Message" },
      })

      expect(i18n.locale).toEqual("ar")
      expect(i18n.locales).toEqual(["en-UK", "ar-AS"])
    })

    it("should override existing data", () => {
      const i18n = setupI18n({
        locale: "en",
        locales: ["en-GB", "en"],
        messages: {
          en: {
            message: "My Message",
          },
        },
      })

      i18n.loadAndActivate({
        locale: "ru",
        messages: {
          message: "My Message",
        },
      })

      expect(i18n.locale).toEqual("ru")
      expect(i18n.locales).toBeUndefined()
    })
  })

  it("._ should format message from catalog", () => {
    const messages = {
      Hello: "Salut",
    }

    const i18n = setupI18n({
      locale: "fr",
      messages: { fr: messages },
    })

    expect(i18n._("Hello")).toEqual("Salut")
    expect(
      i18n._({
        id: "My name is {name}",
        message: "Je m'appelle {name}",
        values: { name: "Fred" },
      })
    ).toEqual("Je m'appelle Fred")

    // alias
    expect(i18n.t("Hello")).toEqual("Salut")

    // missing { name }
    expect(
      i18n._({
        id: "My name is {name}",
        message: "Je m'appelle {name}",
      })
    ).toEqual("Je m'appelle")

    // Untranslated message
    expect(i18n._("Missing message")).toEqual("Missing message")
    expect(i18n._({ id: "missing", message: "Missing message" })).toEqual(
      "Missing message"
    )
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

  it("._ should translate message from variable", () => {
    const messages = {
      Hello: "Salut",
    }

    const i18n = setupI18n({
      locale: "fr",
      messages: { fr: messages },
    })
    const hello = "Hello"
    expect(i18n._(hello)).toEqual("Salut")
  })

  it("._ allow escaping syntax characters", () => {
    const messages = {}

    const i18n = setupI18n({
      locale: "es",
      messages: { es: messages },
    })

    expect(
      i18n._({
        id: "My ''name'' is '{name}'",
        message: "Mi ''nombre'' es '{name}'",
      })
    ).toEqual("Mi 'nombre' es {name}")
  })

  it("._ shouldn't compile messages in production", () => {
    const messages = {
      Hello: "Salut",
      "My name is {name}": "Je m'appelle {name}",
    }

    mockEnv("production", () => {
      const { setupI18n } = require("@lingui/core")
      const i18n = setupI18n({
        locale: "fr",
        messages: { fr: messages },
      })

      expect(i18n._("My name is {name}", { name: "Fred" })).toEqual(
        "Je m'appelle {name}"
      )
    })
  })

  it("._ shouldn't compiled message from catalogs in development", () => {
    const messages = {
      Hello: "Salut",
      "My name is {name}": "Je m'appelle {name}",
    }

    mockEnv("development", () => {
      const { setupI18n } = require("@lingui/core")
      const i18n = setupI18n({
        locale: "fr",
        messages: { fr: messages },
      })

      expect(i18n._("My name is {name}")).toEqual("Je m'appelle {name}")
    })
  })

  it("._ should emit missing event for missing translation", () => {
    const i18n = setupI18n({
      locale: "en",
      messages: { en: { exists: "exists" } },
    })

    const handler = jest.fn()
    i18n.on("missing", handler)
    i18n._("exists")
    expect(handler).toHaveBeenCalledTimes(0)
    i18n._("missing")
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith({
      id: "missing",
      locale: "en",
    })
    i18n.t("missing")
    expect(handler).toHaveBeenCalledTimes(2)
  })

  it("._ should emit missing event for undefined id", () => {
    const i18n = setupI18n({
      locale: "en",
      messages: { en: {} },
    })

    const handler = jest.fn()
    i18n.on("missing", handler)
    // @ts-expect-error 'id' should be of 'MessageDescriptor' or 'string' type.
    i18n._()
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith({
      id: "",
      locale: "en",
    })
  })

  describe("params.missing - handling missing translations", () => {
    it("._ should return custom string for missing translations", () => {
      const i18n = setupI18n({
        missing: "xxx",
        locale: "en",
        messages: { en: { exists: "exists" } },
      })
      expect(i18n._("exists")).toEqual("exists")
      expect(i18n._("missing")).toEqual("xxx")
    })

    it("._ should call a function with message ID of missing translation", () => {
      const missing = jest.fn((locale, id) => id.split("").reverse().join(""))
      const i18n = setupI18n({
        locale: "en",
        messages: {
          en: {},
        },
        missing,
      })
      expect(i18n._("missing")).toEqual("gnissim")
      expect(missing).toHaveBeenCalledWith("en", "missing")
    })
  })
})

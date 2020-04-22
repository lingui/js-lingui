import {setupI18n} from "@lingui/core"
import {mockConsole, mockEnv} from "@lingui/jest-mocks"

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
      i18n.load("en", messages)
      i18n.activate("en")
      expect(i18n.messages).toEqual(messages)

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
        localeData: {
          en: {},
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
        expect(console.warn).toBeCalledWith(
          'Locale data for locale "xyz" not loaded. Plurals won\'t work correctly.'
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
      messages: { fr: messages },
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
      messages: { fr: messages },
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
      messages: { es: messages },
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
        messages: { fr: messages },
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
        messages: { en: { exists: "exists" } },
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

  describe("handling formatters errors", function () {
    const englishPlurals = {
      plurals(value, ordinal) {
        if (ordinal) {
          return { "1": "one", "2": "two", "3": "few" }[value] || "other"
        } else {
          return value === 1 ? "one" : "other"
        }
      },
    }

    const nullPlurals = { plurals: () => null }

    const setupI18nWithMessage = (message )=> setupI18n({
      locale: "en",
      messages: { en: {"message": message} }
    })

    it("._ should ignore not defined variable", function () {
      const i18n = setupI18nWithMessage("My name is {name}")

      expect(i18n._("message")).toEqual("My name is")
    })

    it("._ should ignore not defined custom formatter", function () {
      const i18n = setupI18nWithMessage("My name is {name, uppercase}")

      expect(i18n._("message", { name: "Fred" })).toEqual("My name is")
    })

    it("._ should return original message for icu parsing errors", function () {
      // some examples of message in invalid ICU format
      const messages = {
        "plural.no-arg": "{count, plural}",
        "plural.extra-arg": "{count, plural, one {Message} other {Messages}, extra-arg}",
        "select.no-arg": "{gender, select}",
        "select.extra-arg": "{gender, select, male {He} female {She}, extra-arg}",
        "selectordinal.no-arg": "{count, selectordinal}",
        "selectordinal.extra-arg": "{count, selectordinal, one {1st message} other {#th message}, extra-arg}",
        "wrong-arg1": "{count, plural, {Message} other {Messages}}",
        "wrong-arg2": "{count, plural, {Message other {Messages}}",
        "wrong-arg3": "{gender, select, {she} other {they}",
        "wrong-arg4": "{gender, select, female {she} {she} other {they}",
        "wrong-arg5": "{count, selectordinal, one other {#th message}",
      };
      const i18n = setupI18n({
        locale: "en",
        messages: { en: messages }
      })

      Object.keys(messages).forEach(messageId => {
        expect(i18n._(messageId, {count: 1})).toEqual(messages[messageId])
      })
    })

    it("._ should ignore plural when plurals method return no value", function () {
      const i18n = setupI18nWithMessage("See {count, plural, one {Message} other {Messages}}")
      i18n.loadLocaleData('en', nullPlurals)

      expect(i18n._("message", {count: 1})).toEqual("See")
    })

    it("._ should ignore plural when plurals method is not defined", function () {
      const i18n = setupI18nWithMessage("See {count, plural, one {Message} other {Messages}}")

      expect(i18n._("message", {count: 1})).toEqual("See")
    })

    it("._ should ignore let handle plurals method case when plural variable is not defined", function () {
      const i18n = setupI18nWithMessage("See {count, plural, one {Message} other {Messages}}")
      i18n.loadLocaleData('en', englishPlurals)

      // en plurals fallback to other
      expect(i18n._("message")).toEqual("See Messages")
    })

    it("._ should ignore selectordinal when plurals method return no value", function () {
      const i18n = setupI18nWithMessage("Open {count, selectordinal, one {1st message} other {#th message}}")
      i18n.loadLocaleData('en', nullPlurals)

      expect(i18n._("message", {count: 1})).toEqual("Open")
    })

    it("._ should ignore plural when selectordinal method return no value", function () {
      const i18n = setupI18nWithMessage("Open {count, selectordinal, one {1st message} other {#th message}}")
      i18n.loadLocaleData('en', nullPlurals)

      expect(i18n._("message")).toEqual("Open")
    })

    it("._ should ignore selectordinal when plurals method is not defined", function () {
      const i18n = setupI18nWithMessage("Open {count, selectordinal, one {1st message} other {#th message}}")

      expect(i18n._("message", {count: 1})).toEqual("Open")
    })

    it("._ should ignore let handle plurals method case when selectordinal variable is not defined", function () {
      const i18n = setupI18nWithMessage("Open {count, selectordinal, one {1st message} other {#th message}}")
      i18n.loadLocaleData('en', englishPlurals)

      // en plurals fallback to other with NaN number
      expect(i18n._("message")).toEqual("Open NaNth message")
    })
  })
})

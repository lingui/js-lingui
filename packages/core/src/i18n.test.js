/* @flow */
import { i18n, setupI18n } from "@lingui/core"
import { mockConsole, mockEnv } from "./mocks"

describe("I18n", function() {
  it("should export named I18n instance", function() {
    expect(i18n).toBeDefined()
  })

  it("should be initialized with empty catalog", function() {
    const i18n = setupI18n()
    expect(i18n.messages).toEqual({})
  })

  it("should bound t method", function() {
    const i18n = setupI18n()
    expect(i18n.t).toBeInstanceOf(Function)

    expect(i18n.t`Message`).toEqual("Message")

    const name = "Fred"
    expect(i18n.t`Hello ${name}`).toEqual("Hello Fred")
  })

  it(".load should load catalog and merge with existing", function() {
    const messages = {
      Hello: "Hello"
    }

    const i18n = setupI18n()
    expect(i18n.messages).toEqual({})

    i18n.load({ en: { messages } })
    i18n.activate("en")
    expect(i18n.messages).toEqual(messages)

    // fr catalog shouldn't affect the english one
    i18n.load({ fr: { messages: { Hello: "Salut" } } })
    expect(i18n.messages).toEqual(messages)

    i18n.load({ en: { messages: { Goodbye: "Goodbye" } } })
    // $FlowIgnore: testing edge case
    i18n.load() // should do nothing
    expect(i18n.messages).toEqual({
      Hello: "Hello",
      Goodbye: "Goodbye"
    })
  })

  it(".loadLanguageData should load language data and merge with existing", function() {
    const languageData = {
      plurals: jest.fn(),
      code: "en_US"
    }

    const i18n = setupI18n({
      language: "en",
      catalogs: {
        en: {
          messages: {},
          languageData
        },
        fr: {
          messages: {}
        }
      }
    })

    expect(i18n.languageData).toEqual(languageData)

    // fr catalog shouldn't affect the english one
    i18n.load({
      fr: {
        messages: {},
        languageData: {
          plurals: jest.fn(),
          code: "fr_FR"
        }
      }
    })
    expect(i18n.languageData).toEqual(languageData)
    // $FlowIgnore: testing edge case
    i18n.load() // should do nothing
    expect(i18n.languageData).toEqual(languageData)
  })

  it(".activate should switch active language", function() {
    const messages = {
      Hello: "Salut"
    }

    const i18n = setupI18n({
      language: "en",
      catalogs: {
        fr: { messages },
        en: { messages: {} }
      }
    })

    expect(i18n.language).toEqual("en")
    expect(i18n.messages).toEqual({})

    i18n.activate("fr")
    // $FlowIgnore: testing edge case
    i18n.activate() // should do nothing
    expect(i18n.language).toEqual("fr")
    expect(i18n.messages).toEqual(messages)
  })

  it(".activate should throw an error about incorrect language", function() {
    const i18n = setupI18n()

    mockConsole(console => {
      i18n.activate("xyz")
      expect(console.warn).toBeCalledWith(
        'Message catalog for locale "xyz" not loaded.'
      )
    })

    mockEnv("production", () => {
      jest.resetModules()
      mockConsole(console => {
        const { setupI18n } = require("@lingui/core")
        const i18n = setupI18n()
        i18n.activate("xyz")
        expect(console.warn).not.toBeCalled()
      })
    })
  })

  it(".use should return new i18n object with switched language", function() {
    const catalogs = {
      en: {
        messages: {
          Hello: "Hello"
        }
      },
      fr: {
        messages: {
          Hello: "Salut"
        }
      }
    }

    const i18n = setupI18n({
      language: "en",
      catalogs
    })

    expect(i18n._("Hello")).toEqual("Hello")

    // change language locally
    expect(i18n.use("fr")._("Hello")).toEqual("Salut")

    // global language hasn't changed
    expect(i18n._("Hello")).toEqual("Hello")
  })

  it(".use should return new i18n object with switched locales", function() {
    const i18n = setupI18n({
      language: "en",
      locales: "en-UK"
    })

    // change locales locally
    const ar = i18n.use("ar")
    expect(
      ar.plural({
        value: 2,
        "=0": "لا كتاب",
        other: "# الكتب"
      })
    ).toEqual("٢ الكتب")

    const uae = i18n.use("ar", "en-UK")
    expect(
      uae.plural({
        value: 2,
        "=0": "لا كتاب",
        other: "# الكتب"
      })
    ).toEqual("2 الكتب")

    const uae2 = i18n.use("ar", ["unknown-locale", "en-UK"])
    expect(
      uae2.plural({
        value: 2,
        "=0": "لا كتاب",
        other: "# الكتب"
      })
    ).toEqual("2 الكتب")

    // global locales hasn't changed
    expect(
      i18n.plural({
        value: 2,
        "=0": "no book",
        other: "# books"
      })
    ).toEqual("2 books")
  })

  it("._ should format message from catalog", function() {
    const messages = {
      Hello: "Salut",
      "My name is {name}": "Je m'appelle {name}"
    }

    const i18n = setupI18n({
      language: "fr",
      catalogs: { fr: { messages } }
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
          defaults: "Missing {name}"
        }
      )
    ).toEqual("Missing Fred")
  })

  it("._ should translate message from variable", function() {
    const messages = {
      Hello: "Salut"
    }

    const i18n = setupI18n({
      language: "fr",
      catalogs: { fr: { messages } }
    })
    const hello = "Hello"
    expect(i18n._(hello)).toEqual("Salut")
  })

  it("._ shouldn't compile messages in production", function() {
    const messages = {
      Hello: "Salut",
      "My name is {name}": "Je m'appelle {name}"
    }

    mockEnv("production", () => {
      const { setupI18n } = require("@lingui/core")
      const i18n = setupI18n({
        language: "fr",
        catalogs: { fr: { messages } }
      })

      expect(i18n._("My name is {name}", { name: "Fred" })).toEqual(
        "Je m'appelle {name}"
      )
    })
  })
})

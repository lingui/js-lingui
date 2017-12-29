/* @flow */
import { i18n, setupI18n } from "lingui-i18n"
import { mockConsole, mockEnv } from "./mocks"
import * as linguiDev from "lingui-i18n/dev"

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

    const i18n = setupI18n({
      development: linguiDev
    })
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
      },
      development: linguiDev
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

    mockConsole(console => {
      mockEnv("production", () => {
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
      catalogs,
      development: linguiDev
    })

    expect(i18n._("Hello")).toEqual("Hello")

    // change language locally
    expect(i18n.use("fr")._("Hello")).toEqual("Salut")

    // global language hasn't changed
    expect(i18n._("Hello")).toEqual("Hello")
  })

  it("._ should format message from catalog", function() {
    const messages = {
      Hello: "Salut",
      "My name is {name}": "Je m'appelle {name}"
    }

    const i18n = setupI18n({
      language: "fr",
      catalogs: { fr: { messages } },
      development: linguiDev
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
      catalogs: { fr: { messages } },
      development: linguiDev
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

import { setupI18n } from "./i18n"
import { mockConsole, mockEnv } from "@lingui/jest-mocks"
import { compileMessage } from "@lingui/message-utils/compileMessage"

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

  it("._ shouldn't compile uncompiled messages in production", () => {
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

  it("._ should use compiled message in production", () => {
    const messages = {
      Hello: "Salut",
      "My name is {name}": compileMessage("Je m'appelle {name}"),
    }

    mockEnv("production", () => {
      const { setupI18n } = require("@lingui/core")
      const i18n = setupI18n({
        locale: "fr",
        messages: { fr: messages },
      })

      expect(i18n._("My name is {name}", { name: "Fred" })).toEqual(
        "Je m'appelle Fred"
      )
    })
  })

  it("._ shouldn't double compile message in development", () => {
    const messages = {
      Hello: "Salut",
      "My name is {name}": compileMessage("Je m'appelle '{name}'"),
    }

    const { setupI18n } = require("@lingui/core")
    const i18n = setupI18n({
      locale: "fr",
      messages: { fr: messages },
    })

    expect(i18n._("My name is {name}", { name: "Fred" })).toEqual(
      "Je m'appelle {name}"
    )
  })

  it("setMessagesCompiler should register a message compiler for production", () => {
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

      i18n.setMessagesCompiler(compileMessage)
      expect(i18n._("My name is {name}", { name: "Fred" })).toEqual(
        "Je m'appelle Fred"
      )
    })
  })

  it("should print warning if uncompiled message is used", () => {
    expect.assertions(1)

    const messages = {
      Hello: "Salut",
    }

    mockEnv("production", () => {
      mockConsole((console) => {
        const { setupI18n } = require("@lingui/core")
        const i18n = setupI18n({
          locale: "fr",
          messages: { fr: messages },
        })

        i18n._("Hello")
        expect(console.warn).toBeCalled()
      })
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

  it("._ should parse unicode sequences even if the same string goes twice in a row", () => {
    const messages = {
      "Software development": "Software\\u00ADentwicklung",
    }
    const i18n = setupI18n({
      locale: "de",
      messages: { de: messages },
    })
    expect(i18n._("Software development")).toEqual("Software­entwicklung")
    expect(i18n._("Software development")).toEqual("Software­entwicklung")
  })

  it("._ should throw a meaningful error when locale is not set", () => {
    const i18n = setupI18n({})
    expect(() =>
      i18n._(
        "Text {0, plural, offset:1 =0 {No books} =1 {1 book} other {# books}}"
      )
    ).toThrowErrorMatchingInlineSnapshot(`
      "Lingui: Attempted to call a translation function without setting a locale.
      Make sure to call \`i18n.activate(locale)\` before using Lingui functions.
      This issue may also occur due to a race condition in your initialization logic."
    `)
  })

  describe("ICU date format", () => {
    const i18n = setupI18n({
      locale: "fr",
      messages: { fr: {} },
    })

    const date = new Date("2014-12-06")

    it("style short", () => {
      expect(
        i18n._("It starts on {someDate, date, short}", {
          someDate: date,
        })
      ).toMatchInlineSnapshot(`"It starts on 06/12/2014"`)
    })

    it("style full", () => {
      expect(
        i18n._("It starts on {someDate, date, full}", {
          someDate: date,
        })
      ).toMatchInlineSnapshot(`"It starts on samedi 6 décembre 2014"`)
    })

    it("style long", () => {
      expect(
        i18n._("It starts on {someDate, date, long}", {
          someDate: date,
        })
      ).toMatchInlineSnapshot(`"It starts on 6 décembre 2014"`)
    })

    it("style default", () => {
      expect(
        i18n._("It starts on {someDate, date, default}", {
          someDate: date,
        })
      ).toMatchInlineSnapshot(`"It starts on 6 déc. 2014"`)
    })

    it("no style", () => {
      expect(
        i18n._("It starts on {someDate, date}", {
          someDate: date,
        })
      ).toMatchInlineSnapshot(`"It starts on 6 déc. 2014"`)
    })

    it("using custom style", () => {
      expect(
        i18n._(
          "It starts on {someDate, date, myStyle}",
          {
            someDate: date,
          },
          {
            formats: {
              myStyle: {
                day: "numeric",
              },
            },
          }
        )
      ).toMatchInlineSnapshot(`"It starts on 6"`)
    })

    it("using date skeleton", () => {
      expect(
        i18n._("It starts on {someDate, date, ::GrMMMdd}", {
          someDate: date,
        })
      ).toMatchInlineSnapshot(`"It starts on 06 déc. 2014 ap. J.-C."`)
    })

    it("should respect locale", () => {
      const i18n = setupI18n({
        locale: "fr",
        messages: { fr: {}, pl: {} },
      })

      const msg = "It starts on {someDate, date, long}"

      expect(
        i18n._(msg, {
          someDate: date,
        })
      ).toMatchInlineSnapshot(`"It starts on 6 décembre 2014"`)

      i18n.activate("pl")

      expect(
        i18n._(msg, {
          someDate: date,
        })
      ).toMatchInlineSnapshot(`"It starts on 6 grudnia 2014"`)
    })
  })
  describe("ICU time format", () => {
    const i18n = setupI18n({
      locale: "fr",
      messages: { fr: {} },
    })

    const date = new Date("2014-12-06::17:40 UTC")

    it("style short", () => {
      expect(
        i18n._("It starts on {someDate, time, short}", {
          someDate: date,
        })
      ).toMatchInlineSnapshot(`"It starts on 17:40"`)
    })

    it("style full", () => {
      expect(
        i18n._("It starts on {someDate, time, full}", {
          someDate: date,
        })
      ).toMatchInlineSnapshot(`"It starts on 17:40:00 UTC"`)
    })

    it("style long", () => {
      expect(
        i18n._("It starts on {someDate, time, long}", {
          someDate: date,
        })
      ).toMatchInlineSnapshot(`"It starts on 17:40:00 UTC"`)
    })

    it("style default", () => {
      expect(
        i18n._("It starts on {someDate, time, default}", {
          someDate: date,
        })
      ).toMatchInlineSnapshot(`"It starts on 17:40:00"`)
    })

    it("no style", () => {
      expect(
        i18n._("It starts on {someDate, time}", {
          someDate: date,
        })
      ).toMatchInlineSnapshot(`"It starts on 17:40:00"`)
    })

    it("using custom style", () => {
      expect(
        i18n._(
          "It starts on {someDate, time, myStyle}",
          {
            someDate: date,
          },
          {
            formats: {
              myStyle: {
                hour: "numeric",
              },
            },
          }
        )
      ).toMatchInlineSnapshot(`"It starts on 17 h"`)
    })

    it("should respect locale", () => {
      const i18n = setupI18n({
        locale: "fr",
        messages: { fr: {}, "en-US": {} },
      })

      const msg = "It starts on {someDate, time, long}"

      expect(
        i18n._(msg, {
          someDate: date,
        })
      ).toMatchInlineSnapshot(`"It starts on 17:40:00 UTC"`)

      i18n.activate("en-US")

      expect(
        i18n._(msg, {
          someDate: date,
        })
      ).toMatchInlineSnapshot(`"It starts on 5:40:00 PM UTC"`)
    })
  })
})

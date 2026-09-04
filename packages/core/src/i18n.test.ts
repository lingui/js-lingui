import { setupI18n } from "./i18n"
import { mockConsole, mockEnv } from "@lingui/test-utils"
import { compileMessage } from "@lingui/message-utils/compileMessage"

describe("I18n", () => {
  describe("I18n.load", () => {
    it("should emit event", () => {
      const i18n = setupI18n()

      const cbChange = vi.fn()
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

    describe("prototype pollution", () => {
      afterEach(() => {
        delete (Object.prototype as any).polluted
      })

      it("should not pollute Object.prototype via __proto__ locale key", () => {
        const i18n = setupI18n()
        i18n.load(JSON.parse('{"__proto__":{"polluted":"yes"}}'))
        expect(({} as any).polluted).toBeUndefined()
      })

      it("should not pollute Object.prototype via __proto__ string locale", () => {
        const i18n = setupI18n()
        i18n.load("__proto__", { polluted: "yes" })
        expect(({} as any).polluted).toBeUndefined()
      })

      it("should not pollute Object.prototype via __proto__ message key", () => {
        const i18n = setupI18n()
        i18n.load("en", JSON.parse('{"__proto__":"yes"}'))
        expect(({} as any).polluted).toBeUndefined()
      })

      it("should still load and merge a normal locale", () => {
        const i18n = setupI18n()
        i18n.load({ en: { Hello: "Hello" } })
        i18n.load({ en: { World: "World" } })
        i18n.activate("en")
        expect(i18n.messages).toEqual({ Hello: "Hello", World: "World" })
      })
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

      const cbChange = vi.fn()
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
          'Messages for locale "xyz" not loaded.',
        )
      })

      mockEnv("production", () => {
        vi.resetModules()
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

      const cbChange = vi.fn()
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
      }),
    ).toEqual("Je m'appelle Fred")

    // alias
    expect(i18n.t("Hello")).toEqual("Salut")

    // missing { name }
    expect(
      i18n._({
        id: "My name is {name}",
        message: "Je m'appelle {name}",
      }),
    ).toEqual("Je m'appelle ")

    // Untranslated message
    expect(i18n._("Missing message")).toEqual("Missing message")
    expect(i18n._({ id: "missing", message: "Missing message" })).toEqual(
      "Missing message",
    )
    expect(i18n._("Missing {name}", { name: "Fred" })).toEqual("Missing Fred")
    expect(
      i18n._(
        "Missing with default",
        { name: "Fred" },
        {
          message: "Missing {name}",
        },
      ),
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
      }),
    ).toEqual("Mi 'nombre' es {name}")
  })

  it("._ should not trim whitespaces in translated messages", () => {
    const messages = {}

    const i18n = setupI18n({
      locale: "es",
      messages: { es: messages },
    })

    expect(
      i18n._({
        id: "msg",
        /* note the space at the end */
        message: " Hello ",
      }),
    ).toEqual(" Hello ")
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
        "Je m'appelle {name}",
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
        "Je m'appelle Fred",
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
      "Je m'appelle {name}",
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
        "Je m'appelle Fred",
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

    const handler = vi.fn()
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

  it("._ should treat an id inherited from Object.prototype as missing", () => {
    const i18n = setupI18n({
      locale: "en",
      messages: { en: { exists: "exists" } },
    })

    const handler = vi.fn()
    i18n.on("missing", handler)
    expect(i18n._("constructor")).toEqual("constructor")
    expect(i18n._("toString")).toEqual("toString")
    expect(handler).toHaveBeenCalledTimes(2)
  })

  it("._ should emit missing event for undefined id", () => {
    const i18n = setupI18n({
      locale: "en",
      messages: { en: {} },
    })

    const handler = vi.fn()
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
      const missing = vi.fn((locale, id) => id.split("").reverse().join(""))
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

  it("._ should decode escape sequences in uncompiled string messages", () => {
    const i18n = setupI18n({
      locale: "en",
      messages: { en: {} },
    })

    expect(i18n._("Hello\\u0020World")).toEqual("Hello World")
    expect(i18n._("Hello\\x20World")).toEqual("Hello World")
    expect(i18n._("Tab\\x09separated")).toEqual("Tab\tseparated")
    expect(i18n._("Mixed\\u0020\\x41nd\\u0020escaped")).toEqual(
      "Mixed And escaped",
    )
  })

  it("._ should throw a meaningful error when locale is not set", () => {
    const i18n = setupI18n({})
    expect(() =>
      i18n._(
        "Text {0, plural, offset:1 =0 {No books} =1 {1 book} other {# books}}",
      ),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: Lingui: Attempted to call a translation function without setting a locale.
      Make sure to call \`i18n.activate(locale)\` before using Lingui functions.
      This issue may also occur due to a race condition in your initialization logic.]
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
        }),
      ).toMatchInlineSnapshot(`"It starts on 06/12/2014"`)
    })

    it("style full", () => {
      expect(
        i18n._("It starts on {someDate, date, full}", {
          someDate: date,
        }),
      ).toMatchInlineSnapshot(`"It starts on samedi 6 décembre 2014"`)
    })

    it("style long", () => {
      expect(
        i18n._("It starts on {someDate, date, long}", {
          someDate: date,
        }),
      ).toMatchInlineSnapshot(`"It starts on 6 décembre 2014"`)
    })

    it("style default", () => {
      expect(
        i18n._("It starts on {someDate, date, default}", {
          someDate: date,
        }),
      ).toMatchInlineSnapshot(`"It starts on 6 déc. 2014"`)
    })

    it("no style", () => {
      expect(
        i18n._("It starts on {someDate, date}", {
          someDate: date,
        }),
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
          },
        ),
      ).toMatchInlineSnapshot(`"It starts on 6"`)
    })

    it("using date skeleton", () => {
      expect(
        i18n._("It starts on {someDate, date, ::GrMMMdd}", {
          someDate: date,
        }),
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
        }),
      ).toMatchInlineSnapshot(`"It starts on 6 décembre 2014"`)

      i18n.activate("pl")

      expect(
        i18n._(msg, {
          someDate: date,
        }),
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
        }),
      ).toMatchInlineSnapshot(`"It starts on 17:40"`)
    })

    it("style full", () => {
      expect(
        i18n._("It starts on {someDate, time, full}", {
          someDate: date,
        }),
      ).toMatchInlineSnapshot(`"It starts on 17:40:00 UTC"`)
    })

    it("style long", () => {
      expect(
        i18n._("It starts on {someDate, time, long}", {
          someDate: date,
        }),
      ).toMatchInlineSnapshot(`"It starts on 17:40:00 UTC"`)
    })

    it("style default", () => {
      expect(
        i18n._("It starts on {someDate, time, default}", {
          someDate: date,
        }),
      ).toMatchInlineSnapshot(`"It starts on 17:40:00"`)
    })

    it("no style", () => {
      expect(
        i18n._("It starts on {someDate, time}", {
          someDate: date,
        }),
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
          },
        ),
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
        }),
      ).toMatchInlineSnapshot(`"It starts on 17:40:00 UTC"`)

      i18n.activate("en-US")

      expect(
        i18n._(msg, {
          someDate: date,
        }),
      ).toMatchInlineSnapshot(`"It starts on 5:40:00 PM UTC"`)
    })
  })

  describe("variables", () => {
    it("should initialize default variables via setupI18n", () => {
      const i18n = setupI18n({
        locale: "en",
        messages: {
          en: {
            welcome:
              "{gender, select, female {[F] Welcome} male {[M] Welcome} other {[N] Welcome}}",
            brand: "Powered by {appName}",
          },
        },
        variables: {
          gender: "female",
          appName: "LinguiApp",
        },
      })

      expect(i18n.variables).toEqual({
        gender: "female",
        appName: "LinguiApp",
      })

      expect(i18n._("welcome")).toEqual("[F] Welcome")
      expect(i18n._("brand")).toEqual("Powered by LinguiApp")
    })

    it("should allow updating variables via setVariables and emit change event", () => {
      const i18n = setupI18n({
        locale: "en",
        messages: {
          en: {
            welcome:
              "{gender, select, female {[F] Welcome} male {[M] Welcome} other {[N] Welcome}}",
          },
        },
        variables: {
          gender: "female",
        },
      })

      const onChange = vi.fn()
      i18n.on("change", onChange)

      expect(i18n._("welcome")).toEqual("[F] Welcome")

      const result = i18n.setVariables({ gender: "male" })
      expect(result).toBe(i18n)
      expect(onChange).toHaveBeenCalledTimes(1)
      expect(i18n.variables).toEqual({ gender: "male" })
      expect(i18n._("welcome")).toEqual("[M] Welcome")
    })

    it("should support functional updates with previous variables", () => {
      const i18n = setupI18n({
        locale: "en",
        messages: {
          en: {
            info: "{appName} version {version} for {gender}",
          },
        },
        variables: {
          appName: "LinguiApp",
          gender: "female",
        },
      })

      i18n.setVariables((prev) => ({
        ...prev,
        version: "6.0",
      }))

      expect(i18n.variables).toEqual({
        appName: "LinguiApp",
        gender: "female",
        version: "6.0",
      })
      expect(i18n._("info")).toEqual("LinguiApp version 6.0 for female")
    })

    it("should allow setting or updating a single variable via setVariable without clobbering", () => {
      const i18n = setupI18n({
        locale: "en",
        messages: {
          en: {
            info: "{appName} version {version} for {gender}",
          },
        },
        variables: {
          appName: "LinguiApp",
          gender: "female",
        },
      })

      const onChange = vi.fn()
      i18n.on("change", onChange)

      const result = i18n.setVariable("version", "6.0")
      expect(result).toBe(i18n)
      expect(onChange).toHaveBeenCalledTimes(1)

      expect(i18n.variables).toEqual({
        appName: "LinguiApp",
        gender: "female",
        version: "6.0",
      })
      expect(i18n._("info")).toEqual("LinguiApp version 6.0 for female")

      i18n.setVariable("version", "6.1")
      expect(i18n.variables.version).toEqual("6.1")
      expect(i18n._("info")).toEqual("LinguiApp version 6.1 for female")

      i18n.setVariable("version", undefined)
      expect("version" in i18n.variables).toBe(false)
      expect(i18n._("info")).toEqual("LinguiApp version  for female")
    })

    it("should support setting computed getter function via setVariable", () => {
      let currentGender = "female"
      const user = {
        get gender() {
          return currentGender
        },
      }

      const i18n = setupI18n({
        locale: "en",
        messages: {
          en: {
            welcome:
              "{gender, select, female {[F] Welcome} male {[M] Welcome} other {[N] Welcome}}",
          },
        },
      })

      i18n.setVariable("gender", () => user.gender)
      expect(i18n._("welcome")).toEqual("[F] Welcome")

      currentGender = "male"
      expect(i18n._("welcome")).toEqual("[M] Welcome")
    })

    it("should prioritize caller-supplied values over default variables", () => {
      const i18n = setupI18n({
        locale: "en",
        messages: {
          en: {
            info: "{appName} greeting: Hello {name}, gender {gender}!",
          },
        },
        variables: {
          appName: "LinguiApp",
          gender: "neutral",
        },
      })

      expect(
        i18n._("info", {
          name: "Alex",
          gender: "female",
        }),
      ).toEqual("LinguiApp greeting: Hello Alex, gender female!")

      expect(
        i18n._("info", {
          name: "Sam",
          gender: undefined,
        }),
      ).toEqual("LinguiApp greeting: Hello Sam, gender neutral!")
    })

    it("should work with message descriptors and i18n.t alias", () => {
      const i18n = setupI18n({
        locale: "en",
        messages: { en: {} },
        variables: {
          appName: "LinguiApp",
        },
      })

      expect(
        i18n._({
          id: "brand",
          message: "Welcome to {appName}!",
        }),
      ).toEqual("Welcome to LinguiApp!")

      expect(
        i18n.t({
          id: "brand",
          message: "Welcome to {appName}!",
        }),
      ).toEqual("Welcome to LinguiApp!")
    })

    it("should support computed properties (getters) and evaluate them dynamically", () => {
      let currentGender = "female"
      const user = {
        get gender() {
          return currentGender
        },
      }

      const i18n = setupI18n({
        locale: "en",
        messages: {
          en: {
            welcome:
              "{gender, select, female {[F] Welcome} male {[M] Welcome} other {[N] Welcome}}",
          },
        },
        variables: {
          get gender() {
            return user.gender
          },
        },
      })

      expect(i18n._("welcome")).toEqual("[F] Welcome")

      currentGender = "male"
      expect(i18n._("welcome")).toEqual("[M] Welcome")
    })

    it("should not evaluate getters if variable is not referenced in the message", () => {
      let getterCalls = 0
      const i18n = setupI18n({
        locale: "en",
        messages: {
          en: {
            simple: "Just a simple message",
          },
        },
        variables: {
          get expensive() {
            getterCalls++
            return "computed"
          },
        },
      })

      expect(i18n._("simple")).toEqual("Just a simple message")
      expect(getterCalls).toEqual(0)
    })

    it("should preserve variables across locale changes", () => {
      const i18n = setupI18n({
        locale: "en",
        messages: {
          en: {
            welcome:
              "{gender, select, female {[F] Welcome} male {[M] Welcome} other {[N] Welcome}}",
          },
          es: {
            welcome:
              "{gender, select, female {[F] Bienvenida} male {[M] Bienvenido} other {[N] Bienvenidx}}",
          },
        },
        variables: {
          gender: "female",
        },
      })

      expect(i18n._("welcome")).toEqual("[F] Welcome")

      i18n.activate("es")
      expect(i18n._("welcome")).toEqual("[F] Bienvenida")
    })
  })
})

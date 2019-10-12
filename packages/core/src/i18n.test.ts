import { I18n } from "@lingui/core"
import { mockEnv } from "@lingui/jest-mocks"

describe("I18n", function() {
  it("._ should format message from catalog", function() {
    const messages = {
      Hello: "Salut",
      "My name is {name}": "Je m'appelle {name}"
    }

    const i18n = new I18n({
      locale: "fr",
      messages
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
          message: "Missing {name}"
        }
      )
    ).toEqual("Missing Fred")
  })

  it("._ should translate message from variable", function() {
    const messages = {
      Hello: "Salut"
    }

    const i18n = new I18n({
      locale: "fr",
      messages
    })
    const hello = "Hello"
    expect(i18n._(hello)).toEqual("Salut")
  })

  it("._ allow escaping syntax characters", () => {
    const messages = {
      "My ''name'' is '{name}'": "Mi ''nombre'' es '{name}'"
    }

    const i18n = new I18n({
      locale: "es",
      messages
    })

    expect(i18n._("My ''name'' is '{name}'")).toEqual("Mi 'nombre' es {name}")
  })

  it("._ shouldn't compile messages in production", function() {
    const messages = {
      Hello: "Salut",
      "My name is {name}": "Je m'appelle {name}"
    }

    mockEnv("production", () => {
      const { I18n } = require("@lingui/core")
      const i18n = new I18n({
        locale: "fr",
        messages
      })

      expect(i18n._("My name is {name}", { name: "Fred" })).toEqual(
        "Je m'appelle {name}"
      )
    })
  })

  describe("params.missing - handling missing translations", function() {
    it("._ should return custom string for missing translations", function() {
      const i18n = new I18n({
        missing: "xxx",
        locale: "en",
        messages: { exists: "exists" }
      })
      expect(i18n._("exists")).toEqual("exists")
      expect(i18n._("missing")).toEqual("xxx")
    })

    it("._ should call a function with message ID of missing translation", function() {
      const missing = jest.fn((locale, id) =>
        id
          .split("")
          .reverse()
          .join("")
      )
      const i18n = new I18n({
        locale: "en",
        missing
      })
      expect(i18n._("missing")).toEqual("gnissim")
      expect(missing).toHaveBeenCalledWith("en", "missing")
    })
  })
})

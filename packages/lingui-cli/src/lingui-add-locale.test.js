import { mockConsole } from "./mocks"
import command from "./lingui-add-locale"

describe("lingui add-locale", function() {
  it("should fail on unknown locale", function() {
    const format = {
      addLocale: () => [false, null]
    }

    mockConsole(console => {
      command(format, ["xyz"])
      expect(console.log).toBeCalledWith(
        expect.stringContaining("Unknown locale:")
      )
      expect(console.log).toBeCalledWith(expect.stringContaining("xyz"))
    })
  })

  it("should add single locale", function() {
    const format = {
      addLocale: () => [true, "locale/en/messages.json"]
    }

    mockConsole(console => {
      command(format, ["en"])
      expect(console.log.mock.calls[0]).toEqual([
        expect.stringContaining("Added locale")
      ])
      expect(console.log.mock.calls[0]).toEqual([expect.stringContaining("en")])
      expect(console.log.mock.calls[2]).toEqual([
        expect.stringContaining("lingui extract")
      ])
    })
  })

  it("should add multiple locales", function() {
    const format = {
      // Locale 'en' will be added, but locale 'fr' already exists
      addLocale: locale => [locale === "en", `locale/${locale}/messages.json`]
    }

    mockConsole(console => {
      command(format, ["en", "fr"])
      expect(console.log.mock.calls[0]).toEqual([
        expect.stringContaining("Added locale")
      ])
      expect(console.log.mock.calls[0]).toEqual([expect.stringContaining("en")])

      expect(console.log.mock.calls[1]).toEqual([
        expect.stringContaining("already exists")
      ])
      expect(console.log.mock.calls[1]).toEqual([expect.stringContaining("fr")])

      expect(console.log.mock.calls[3]).toEqual([
        expect.stringContaining("lingui extract")
      ])
    })
  })
})

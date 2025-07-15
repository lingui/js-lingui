import { makeConfig } from "./makeConfig"
import { mockConsole } from "@lingui/jest-mocks"
import { defineConfig } from "./defineConfig"
import { LinguiConfig } from "./types"

describe("@lingui/conf", () => {
  describe("defineConfig", () => {
    it("Should simply return a passed config", () => {
      const config: LinguiConfig = { locales: ["en", "pl"], sourceLocale: "en" }

      expect(defineConfig(config)).toStrictEqual(config)
    })
  })

  it("should validate `locale`", () => {
    mockConsole((console) => {
      makeConfig({})
      expect(console.warn).not.toBeCalled()
      expect(console.error).toBeCalledWith(
        expect.stringContaining("No locales defined")
      )
    })
  })

  describe("Build parent cldr fallbackLocales", () => {
    it("if fallbackLocales.default is defined, we dont build the cldr", () => {
      const config = makeConfig({
        locales: ["en-US", "es-MX"],
        fallbackLocales: {
          "en-US": ["en"],
          default: "en",
        },
      })

      expect(config.fallbackLocales).toEqual({
        "en-US": ["en"],
        default: "en",
      })
    })

    it("if fallbackLocales.default is not defined, we build the cldr", () => {
      const config = makeConfig({
        locales: ["en-US", "es-MX"],
      })

      expect(config.fallbackLocales).toEqual({
        "en-US": "en",
        "es-MX": "es",
      })
    })

    it("if fallbackLocales = false, we dont build the cldr", () => {
      const config = makeConfig({
        locales: ["en-US", "es-MX"],
        fallbackLocales: false,
      })

      expect(config.fallbackLocales).toEqual({})
    })
  })
})

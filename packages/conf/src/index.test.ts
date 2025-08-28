import path from "path"
import { getConfig } from "./getConfig"
import { makeConfig } from "./makeConfig"
import { mockConsole, getConsoleMockCalls } from "@lingui/jest-mocks"
import { defineConfig } from "./defineConfig"
import { LinguiConfig } from "./types"

describe("@lingui/conf", () => {
  describe("defineConfig", () => {
    it("Should simply return a passed config", () => {
      const config: LinguiConfig = { locales: ["en", "pl"], sourceLocale: "en" }

      expect(defineConfig(config)).toStrictEqual(config)
    })
  })

  it("should return default config", () => {
    mockConsole((console) => {
      const config = getConfig({
        cwd: path.resolve(__dirname, path.join("fixtures", "valid")),
      })
      expect(console.error).not.toBeCalled()
      expect(console.warn).not.toBeCalled()
      expect(config).toMatchSnapshot({
        resolvedConfigPath: expect.stringContaining(".linguirc"),
      })
    })
  })

  it("should throw error if config is not discovered", () => {
    mockConsole((console) => {
      const exec = () =>
        getConfig({
          cwd: path.resolve(__dirname, path.join("fixtures")),
        })

      expect(exec).toThrow()
      expect(getConsoleMockCalls(console.error)).toMatchSnapshot()

      expect(console.warn).not.toBeCalled()
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

  describe("config file", () => {
    it("searches for a .linguirc config file", () => {
      const config = getConfig({
        cwd: path.resolve(__dirname, path.join("fixtures", "valid")),
      })
      expect(config.locales).toEqual(["en-gb"])
    })

    it("allows specific config file to be loaded with configPath parameter", () => {
      const config = getConfig({
        configPath: path.resolve(
          __dirname,
          path.join("fixtures", "valid", "custom.config.js")
        ),
      })
      expect(config.locales).toEqual(["cs", "sk"])
    })

    it("loads TypeScript config", () => {
      const config = getConfig({
        configPath: path.resolve(
          __dirname,
          path.join("fixtures", "valid", "custom.config.ts")
        ),
      })
      expect(config.locales).toEqual(["pl"])
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
})

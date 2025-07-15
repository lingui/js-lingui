import path from "path"
import { getConfig } from "./getConfig"
import { mockConsole } from "@lingui/jest-mocks"

describe("getConfig", () => {
  const fixturesPath = path.resolve(__dirname, "fixtures")
  const validPath = path.join(fixturesPath, "valid")

  describe("config file discovery", () => {
    it("should find and load .linguirc config file", () => {
      mockConsole((console) => {
        const config = getConfig({
          cwd: validPath,
          skipValidation: true,
        })
        expect(console.error).not.toBeCalled()
        expect(console.warn).not.toBeCalled()
        expect(config.locales).toEqual(["en-gb"])
        expect(config.sourceLocale).toEqual("en-gb")
      })
    })

    it("should load JavaScript config file", () => {
      mockConsole((console) => {
        const config = getConfig({
          configPath: path.join(validPath, "lingui.config.js"),
          skipValidation: true,
        })

        expect(console.error).not.toBeCalled()
        expect(console.warn).not.toBeCalled()
        expect(config.locales).toEqual(["en", "fr"])
        expect(config.sourceLocale).toEqual("en")
      })
    })

    it("should load TypeScript config file", () => {
      mockConsole((console) => {
        const config = getConfig({
          configPath: path.join(validPath, "lingui.config.ts"),
          skipValidation: true,
        })
        expect(console.error).not.toBeCalled()
        expect(console.warn).not.toBeCalled()
        expect(config.locales).toEqual(["en", "it"])
        expect(config.sourceLocale).toEqual("en")
      })
    })

    it("should load CommonJS config file", () => {
      mockConsole((console) => {
        const config = getConfig({
          configPath: path.join(validPath, "lingui.config.cjs"),
          skipValidation: true,
        })
        expect(console.error).not.toBeCalled()
        expect(console.warn).not.toBeCalled()
        expect(config.locales).toEqual(["en", "de"])
        expect(config.sourceLocale).toEqual("en")
      })
    })

    it("should load ES module config file", () => {
      mockConsole((console) => {
        const config = getConfig({
          configPath: path.join(validPath, "lingui.config.mjs"),
          skipValidation: true,
        })
        expect(console.error).not.toBeCalled()
        expect(console.warn).not.toBeCalled()
        expect(config.locales).toEqual(["en", "es"])
        expect(config.sourceLocale).toEqual("en")
      })
    })

    it("should load YAML config file with deprecation warning", () => {
      mockConsole((console) => {
        const config = getConfig({
          configPath: path.join(validPath, "lingui.config.yaml"),
          skipValidation: true,
        })
        expect(console.error).not.toBeCalled()
        expect(console.warn).toBeCalledWith(
          "YAML config support is deprecated and will be removed in future versions."
        )
        expect(config.locales).toEqual(["en", "ru"])
        expect(config.sourceLocale).toEqual("en")
      })
    })

    it("should load YML config file with deprecation warning", () => {
      mockConsole((console) => {
        const config = getConfig({
          configPath: path.join(validPath, "lingui.config.yml"),
          skipValidation: true,
        })
        expect(console.error).not.toBeCalled()
        expect(console.warn).toBeCalledWith(
          "YAML config support is deprecated and will be removed in future versions."
        )
        expect(config.locales).toEqual(["en", "pt"])
        expect(config.sourceLocale).toEqual("en")
      })
    })

    it("should load config from package.json", () => {
      mockConsole((console) => {
        const config = getConfig({
          configPath: path.join(validPath, "package.json"),
          skipValidation: true,
        })
        expect(console.error).not.toBeCalled()
        expect(console.warn).not.toBeCalled()
        expect(config.locales).toEqual(["en", "zh"])
        expect(config.sourceLocale).toEqual("en")
      })
    })

    it("should load specific config file with configPath parameter", () => {
      mockConsole((console) => {
        const config = getConfig({
          configPath: path.join(validPath, "custom.config.js"),
          skipValidation: true,
        })
        expect(console.error).not.toBeCalled()
        expect(console.warn).not.toBeCalled()
        expect(config.locales).toEqual(["cs", "sk"])
        expect(config.sourceLocale).toEqual("cs")
      })
    })

    it("should load TypeScript custom config file", () => {
      mockConsole((console) => {
        const config = getConfig({
          configPath: path.join(validPath, "custom.config.ts"),
          skipValidation: true,
        })
        expect(console.error).not.toBeCalled()
        expect(console.warn).not.toBeCalled()
        expect(config.locales).toEqual(["pl"])
        expect(config.sourceLocale).toEqual("pl")
      })
    })
  })

  describe("error handling", () => {
    it("should throw error if config is not found", () => {
      mockConsole((console) => {
        const exec = () =>
          getConfig({
            cwd: fixturesPath,
          })

        expect(exec).toThrow("No Lingui config found")
        expect(console.error).toBeCalledWith(
          "Lingui was unable to find a config!\n"
        )
        expect(console.error).toBeCalledWith(expect.stringContaining("Create"))
        expect(console.warn).not.toBeCalled()
      })
    })

    it("should throw error if specific config file doesn't exist", () => {
      mockConsole((console) => {
        const exec = () =>
          getConfig({
            configPath: path.join(validPath, "nonexistent.config.js"),
          })

        expect(exec).toThrow("No Lingui config found")
        expect(console.error).toBeCalledWith(
          "Lingui was unable to find a config!\n"
        )
        expect(console.warn).not.toBeCalled()
      })
    })
  })

  describe("environment variable support", () => {
    it("should use LINGUI_CONFIG environment variable", () => {
      const originalEnv = process.env.LINGUI_CONFIG
      process.env.LINGUI_CONFIG = path.join(validPath, "custom.config.js")

      try {
        mockConsole((console) => {
          const config = getConfig({ skipValidation: true })
          expect(console.error).not.toBeCalled()
          expect(console.warn).not.toBeCalled()
          expect(config.locales).toEqual(["cs", "sk"])
          expect(config.sourceLocale).toEqual("cs")
        })
      } finally {
        process.env.LINGUI_CONFIG = originalEnv
      }
    })
  })

  describe("default config and snapshots", () => {
    it("should return default config", () => {
      mockConsole((console) => {
        const config = getConfig({
          cwd: path.resolve(__dirname, path.join("fixtures", "valid")),
        })
        expect(console.error).not.toBeCalled()
        expect(console.warn).not.toBeCalled()
        expect(config).toMatchSnapshot()
      })
    })
  })
})

import { validate } from "jest-validate"
import {
  getConfig,
  replaceRootDir,
  catalogMigration,
  configValidation
} from "@lingui/conf"
import { mockConsole, getConsoleMockCalls } from "@lingui/jest-mocks"

describe("@lingui/conf", function() {
  it("should return default config", function() {
    const config = getConfig()
    expect(config).toBeInstanceOf(Object)
    expect(config.sourceLocale).toBeDefined()
    expect(config.fallbackLocale).toBeDefined()
    expect(config.pseudoLocale).toBeDefined()
    expect(config.extractBabelOptions).toBeDefined()
    expect(config).toMatchSnapshot()

    // Deprecated and migrated configuration
    expect(config.localeDir).not.toBeDefined()
    expect(config.srcPathDirs).not.toBeDefined()
    expect(config.srcPathIgnorePatterns).not.toBeDefined()
  })

  it("should replace <rootDir>", function() {
    const config = replaceRootDir(
      {
        boolean: false,
        catalogs: {
          "<rootDir>/locale/{locale}/messages": [
            "<rootDir>/src",
            "!<rootDir>/ignored"
          ]
        }
      },
      "/Root"
    )

    expect(config.boolean).toEqual(false)
    expect(config.catalogs).toEqual({
      "/Root/locale/{locale}/messages": ["/Root/src", "!/Root/ignored"]
    })
  })

  describe("catalogMigration", function() {
    it("should show deprecation warning", function() {
      mockConsole(console => {
        validate(
          {
            localeDir: "./locale",
            srcPathDirs: ["./src"],
            srcPathIgnorePatterns: ["/node_modules/"]
          },
          configValidation
        )
        expect(getConsoleMockCalls(console.warn)).toMatchSnapshot()
      })
    })

    it("should provide default config", function() {
      const config = {}

      expect(catalogMigration(config)).toEqual({
        catalogs: {
          "locale/{locale}/messages": ["<rootDir>", "!node_modules/"]
        }
      })
    })

    it("should normalize string localeDir", function() {
      const config = {
        localeDir: "./locale"
      }

      expect(catalogMigration(config)).toEqual({
        catalogs: {
          "locale/{locale}/messages": ["<rootDir>", "!node_modules/"]
        }
      })
    })
    it("should migrate srcPathDirs and srcPathIgnorePatterns", function() {
      const config = {
        localeDir: "locale",
        srcPathDirs: ["src"],
        srcPathIgnorePatterns: ["src/node_modules/"]
      }

      expect(catalogMigration(config)).toEqual({
        catalogs: {
          "locale/{locale}/messages": ["src", "!src/node_modules/"]
        }
      })
    })
  })
})

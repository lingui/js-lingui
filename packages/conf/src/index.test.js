import path from "path"
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
    expect.assertions(2)

    mockConsole(console => {
      const config = getConfig({
        cwd: path.resolve(__dirname, path.join("fixtures", "valid"))
      })
      expect(console.warn).not.toBeCalled()
      expect(config).toMatchSnapshot()
    })
  })

  it("should validate `locale`", function() {
    expect.assertions(2)

    mockConsole(console => {
      getConfig()
      expect(console.warn).not.toBeCalled()
      expect(console.error).toBeCalledWith(
        expect.stringContaining("No locales defined")
      )
    })
  })

  it("should replace <rootDir>", function() {
    const config = replaceRootDir(
      {
        boolean: false,
        catalogs: {
          ["<rootDir>/locales/{locale}/messages"]: [
            "<rootDir>/src",
            "!<rootDir>/ignored"
          ]
        }
      },
      "/Root"
    )

    expect(config.boolean).toEqual(false)
    expect(config.catalogs).toEqual({
      "/Root/locales/{locale}/messages": ["/Root/src", "!/Root/ignored"]
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

    it("shouldn't provide default config if no obsolete config is defined", function() {
      const config = {}

      expect(catalogMigration(config)).toEqual({})
    })

    it("should normalize string localeDir", function() {
      const config = {
        localeDir: "./locales"
      }

      expect(catalogMigration(config)).toEqual({
        catalogs: {
          "locales/{locale}/messages": ["<rootDir>", "!*/node_modules/*"]
        }
      })
    })

    it("should migrate srcPathDirs and srcPathIgnorePatterns", function() {
      const config = {
        localeDir: "locales",
        srcPathDirs: ["src"],
        srcPathIgnorePatterns: ["src/node_modules/"]
      }

      expect(catalogMigration(config)).toEqual({
        catalogs: {
          "locales/{locale}/messages": ["src", "!src/node_modules/"]
        }
      })
    })
  })
})

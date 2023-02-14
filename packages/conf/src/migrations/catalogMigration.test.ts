import { getConsoleMockCalls, mockConsole } from "@lingui/jest-mocks"
import { catalogMigration, DeprecatedLocaleDir } from "./catalogMigration"
import { LinguiConfig, makeConfig } from "@lingui/conf"

type DeprecatedConfig = Partial<LinguiConfig & DeprecatedLocaleDir>

describe("catalogMigration", () => {
  it("should show deprecation warning", () => {
    const config: DeprecatedConfig = {
      localeDir: "./locale",
      srcPathDirs: ["./src"],
      srcPathIgnorePatterns: ["/node_modules/"],
      rootDir: "/myRoot",
    }

    mockConsole((console) => {
      makeConfig(config)
      expect(getConsoleMockCalls(console.warn)).toMatchSnapshot()
    })
  })

  it("shouldn't provide default config if no obsolete config is defined", () => {
    expect(catalogMigration({})).toEqual({})
  })

  it("should normalize string localeDir", () => {
    const config: DeprecatedConfig = {
      localeDir: "./locales",
      rootDir: "/myRoot",
    }

    mockConsole((console) => {
      expect(makeConfig(config)).toMatchObject({
        catalogs: [
          {
            path: "locales/{locale}/messages",
            include: ["/myRoot"],
            exclude: ["**/node_modules/**"],
          },
        ],
      })
      expect(console.warn).toBeCalled()
    })
  })

  it("should migrate srcPathDirs and srcPathIgnorePatterns", () => {
    const config: DeprecatedConfig = {
      localeDir: "locales",
      srcPathDirs: ["src"],
      srcPathIgnorePatterns: ["src/node_modules/"],
    }

    mockConsole((console) => {
      expect(makeConfig(config)).toMatchObject({
        catalogs: [
          {
            path: "locales/{locale}/messages",
            include: ["src"],
            exclude: ["src/node_modules/"],
          },
        ],
      })
      expect(console.warn).toBeCalled()
    })
  })
})

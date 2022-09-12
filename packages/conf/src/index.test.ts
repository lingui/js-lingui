import path from "path"
import mockFs from "mock-fs"
import { validate } from "jest-validate"
import {
  getConfig,
  replaceRootDir,
  catalogMigration,
  configValidation,
} from "@lingui/conf"
import { mockConsole, getConsoleMockCalls } from "@lingui/jest-mocks"

describe("@lingui/conf", function () {
  it("should return default config", function () {
    expect.assertions(2)

    mockConsole((console) => {
      const config = getConfig({
        cwd: path.resolve(__dirname, path.join("fixtures", "valid")),
      })
      expect(console.warn).not.toBeCalled()
      expect(config).toMatchSnapshot()
    })
  })

  it("should validate `locale`", function () {
    expect.assertions(2)

    mockConsole((console) => {
      getConfig()
      expect(console.warn).not.toBeCalled()
      expect(console.error).toBeCalledWith(
        expect.stringContaining("No locales defined")
      )
    })
  })

  it("should replace <rootDir>", function () {
    const config = replaceRootDir(
      // @ts-ignore
      {
        compileNamespace: "cjs",
        catalogs: [
          {
            path: "/",
            include: ["<rootDir>/src"],
            exclude: ["<rootDir>/ignored"],
          },
        ],
      },
      "/Root"
    )

    expect(config.compileNamespace).toEqual("cjs")
    expect(config.catalogs).toEqual([
      {
        path: "/",
        include: ["/Root/src"],
        exclude: ["/Root/ignored"],
      },
    ])
  })

  describe("catalogMigration", function () {
    it("should show deprecation warning", function () {
      mockConsole((console) => {
        validate(
          {
            localeDir: "./locale",
            srcPathDirs: ["./src"],
            srcPathIgnorePatterns: ["/node_modules/"],
          },
          configValidation
        )
        expect(getConsoleMockCalls(console.warn)).toMatchSnapshot()
      })
    })

    it("shouldn't provide default config if no obsolete config is defined", function () {
      const config = {}

      // @ts-ignore
      expect(catalogMigration(config)).toEqual({})
    })

    it("should normalize string localeDir", function () {
      const config = {
        localeDir: "./locales",
      }

      // @ts-ignore
      expect(catalogMigration(config)).toEqual({
        catalogs: [
          {
            path: "locales/{locale}/messages",
            include: ["<rootDir>"],
            exclude: ["**/node_modules/**"],
          },
        ],
      })
    })

    it("should migrate srcPathDirs and srcPathIgnorePatterns", function () {
      const config = {
        localeDir: "locales",
        srcPathDirs: ["src"],
        srcPathIgnorePatterns: ["src/node_modules/"],
      }

      // @ts-ignore
      expect(catalogMigration(config)).toEqual({
        catalogs: [
          {
            path: "locales/{locale}/messages",
            include: ["src"],
            exclude: ["src/node_modules/"],
          },
        ],
      })
    })
  })

  describe("config file", function () {
    it("searches for a .linguirc config file", function () {
      // hide validation warning about missing locales
      mockConsole(() => {
        const config = getConfig({
          cwd: path.resolve(__dirname, path.join("fixtures", "valid")),
        })
        expect(config.locales).toEqual(["en-gb"])
      })
    })

    it("allows specific config file to be loaded with configPath parameter", function () {
      // hide validation warning about missing locales
      mockConsole(() => {
        const config = getConfig({
          configPath: path.resolve(
            __dirname,
            path.join("fixtures", "valid", "custom.config.js")
          ),
        })
        expect(config.locales).toEqual(["cs", "sk"])
      })
    })

    it("loads TypeScript config", function () {
      // hide validation warning about missing locales
      mockConsole(() => {
        const config = getConfig({
          configPath: path.resolve(
            __dirname,
            path.join("fixtures", "valid", "custom.config.ts")
          ),
        })
        expect(config.locales).toEqual(["pl"])
      })
    })

    describe("fallbackLocales logic", () => {
      afterEach(() => {
        mockFs.restore()
      })

      it("if fallbackLocale is defined, we use the default one on fallbackLocales", () => {
        mockFs({
          ".linguirc": JSON.stringify({
            locales: ["en-US"],
            fallbackLocale: "en",
          }),
        })
        mockConsole((console) => {
          const config = getConfig({
            configPath: ".linguirc",
          })
          expect(config.fallbackLocales.default).toEqual("en")
          expect(getConsoleMockCalls(console.warn)).toMatchSnapshot()
        })
      })

      it("if fallbackLocales default is defined, we dont build the cldr", () => {
        const config = getConfig({
          configPath: path.resolve(
            __dirname,
            path.join("fixtures", "valid", ".fallbacklocalesrc")
          ),
        })
        expect(config.fallbackLocales).toEqual({
          "en-US": ["en"],
          default: "en",
        })
      })
    })
  })
})

// @flow
import fs from "fs"
import path from "path"
import mockFs from "mock-fs"
import { mockConsole, mockConfig } from "@lingui/jest-mocks"

import { getCatalogs, Catalog } from "./ngCatalog"

describe("Catalog", function() {
  afterEach(() => {
    mockFs.restore()
  })

  describe("collect", function() {
    it("should extract messages from source files", function() {
      const catalog = new Catalog(
        {
          name: "messages",
          path: "locales/{locale}",
          include: [path.resolve(__dirname, "./fixtures/collect/")],
          exclude: []
        },
        mockConfig()
      )

      const messages = catalog.collect()
      expect(messages).toMatchSnapshot()
    })

    it("should handle errors", function() {
      const catalog = new Catalog(
        {
          name: "messages",
          path: "locales/{locale}",
          include: [path.resolve(__dirname, "./fixtures/collect-invalid/")],
          exclude: []
        },
        mockConfig()
      )

      mockConsole(console => {
        const messages = catalog.collect()
        expect(console.error).toBeCalledWith(
          expect.stringContaining(`Cannot process file`)
        )
        expect(messages).toMatchSnapshot()
      })
    })
  })

  describe("read", function() {
    it("should return null if file does not exist", function() {
      // mock empty filesystem
      mockFs()

      const catalog = new Catalog(
        {
          name: "messages",
          path: "locales/{locale}",
          include: [],
          exclude: []
        },
        mockConfig()
      )

      const messages = catalog.read("en")
      expect(messages).toBeNull()
    })

    it("should read file in given format", function() {
      mockFs({
        en: {
          "messages.po": fs.readFileSync(
            path.resolve(__dirname, "formats/fixtures/messages.po")
          )
        }
      })
      const catalog = new Catalog(
        {
          name: "messages",
          path: "{locale}/messages",
          include: []
        },
        mockConfig()
      )

      const messages = catalog.read("en")

      mockFs.restore()
      expect(messages).toMatchSnapshot()
    })

    it("should read file in previous format", function() {
      mockFs({
        en: {
          "messages.json": fs.readFileSync(
            path.resolve(__dirname, "formats/fixtures/messages.json")
          )
        }
      })
      const catalog = new Catalog(
        {
          name: "messages",
          path: "{locale}/messages",
          include: []
        },
        mockConfig({ prevFormat: "minimal" })
      )

      const messages = catalog.read("en")

      mockFs.restore()
      expect(messages).toMatchSnapshot()
    })
  })

  describe("readAll", function() {
    it("should read existing catalogs for all locales", function() {
      const catalog = new Catalog(
        {
          name: "messages",
          path: path.resolve(
            __dirname,
            path.join("fixtures", "readAll", "{locale}", "messages")
          ),
          include: []
        },
        mockConfig({
          locales: ["en", "cs"]
        })
      )

      const messages = catalog.readAll()
      expect(messages).toMatchSnapshot()
    })
  })

  /**
   * Convert JSON format to PO and then back to JSON.
   * - Compare that original and converted JSON file are identical
   * - Check the content of PO file
   */
  it("should convert catalog format", function() {
    mockFs({
      en: {
        "messages.json": fs.readFileSync(
          path.resolve(__dirname, "formats/fixtures/messages.json")
        ),
        "messages.po": mockFs.file()
      }
    })

    const fileContent = format =>
      fs
        .readFileSync("./en/messages." + (format === "po" ? "po" : "json"))
        .toString()
        .trim()

    const catalogConfig = {
      name: "messages",
      path: "{locale}/messages",
      include: []
    }

    const originalJson = fileContent("json")
    const po2json = new Catalog(
      catalogConfig,
      mockConfig({
        format: "po",
        prevFormat: "minimal"
      })
    )
    po2json.write("en", po2json.read("en"))
    const convertedPo = fileContent("po")

    const json2po = new Catalog(
      catalogConfig,
      mockConfig({
        format: "minimal",
        prevFormat: "po",
        localeDir: "."
      })
    )
    json2po.write("en", json2po.read("en"))
    const convertedJson = fileContent("json")

    mockFs.restore()
    expect(originalJson).toEqual(convertedJson)
    expect(convertedPo).toMatchSnapshot()
  })
})

describe("getCatalogs", function() {
  afterEach(() => {
    mockFs.restore()
  })

  it("should get single catalog if catalogPath doesn't include {name} pattern", function() {
    const config = mockConfig({
      catalogs: {
        "./src/locales/{locale}": "./src/"
      }
    })
    expect(getCatalogs(config)).toEqual([
      new Catalog(
        {
          name: null,
          path: "src/locales/{locale}",
          include: ["src/"],
          exclude: []
        },
        config
      )
    ])
  })

  it("should have catalog name and ignore patterns", function() {
    const config = mockConfig({
      catalogs: {
        "src/locales/{locale}/all": [
          "src/",
          "/absolute/path/",
          "!node_modules/"
        ]
      }
    })
    expect(getCatalogs(config)).toEqual([
      new Catalog(
        {
          name: "all",
          path: "src/locales/{locale}/all",
          include: ["src/", "/absolute/path/"],
          exclude: ["node_modules/"]
        },
        config
      )
    ])
  })

  it("should expand {name} for matching directories", function() {
    mockFs({
      componentA: {
        "index.js": mockFs.file()
      },
      componentB: {
        "index.js": mockFs.file()
      }
    })

    const config = mockConfig({
      catalogs: {
        "{name}/locales/{locale}": "./{name}/"
      }
    })
    expect(getCatalogs(config)).toEqual([
      new Catalog(
        {
          name: "componentA",
          path: "componentA/locales/{locale}",
          include: ["componentA/"],
          exclude: []
        },
        config
      ),
      new Catalog(
        {
          name: "componentB",
          path: "componentB/locales/{locale}",
          include: ["componentB/"],
          exclude: []
        },
        config
      )
    ])
  })

  it("shouldn't expand {name} for ignored directories", function() {
    mockFs({
      componentA: {
        "index.js": mockFs.file()
      },
      componentB: {
        "index.js": mockFs.file()
      }
    })

    const config = mockConfig({
      catalogs: {
        "./{name}/locales/{locale}": ["./{name}/", "!componentB/"]
      }
    })
    expect(getCatalogs(config)).toEqual([
      new Catalog(
        {
          name: "componentA",
          path: "componentA/locales/{locale}",
          include: ["componentA/"],
          exclude: ["componentB/"]
        },
        config
      )
    ])
  })

  it("should warn if catalogPath is a directory", function() {
    expect(() =>
      getCatalogs(
        mockConfig({
          catalogs: {
            "./locales/{locale}/": "."
          }
        })
      )
    ).toThrowErrorMatchingSnapshot()

    // Use valus from config in error message
    expect(() =>
      getCatalogs(
        mockConfig({
          locales: ["cs"],
          format: "minimal",
          catalogs: {
            "./locales/{locale}/": "."
          }
        })
      )
    ).toThrowErrorMatchingSnapshot()
  })

  it("should warn about missing {name} pattern in catalog path", function() {
    expect(() =>
      getCatalogs(
        mockConfig({
          catalogs: {
            "./locales/{locale}": "./{name}/"
          }
        })
      )
    ).toThrowErrorMatchingSnapshot()
  })
})

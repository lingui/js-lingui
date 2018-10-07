// @flow
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
      const catalog = new Catalog({
        name: "messages",
        path: "locales/{locale}",
        include: [path.resolve(__dirname, "./fixtures/collect/")],
        exclude: []
      })

      const messages = catalog.collect()
      expect(messages).toMatchSnapshot()
    })

    it("should handle errors", function() {
      const catalog = new Catalog({
        name: "messages",
        path: "locales/{locale}",
        include: [path.resolve(__dirname, "./fixtures/collect-invalid/")],
        exclude: []
      })

      mockConsole(console => {
        const messages = catalog.collect()
        expect(console.error).toBeCalledWith(
          expect.stringContaining(`Cannot process file`)
        )
        expect(messages).toMatchSnapshot()
      })
    })
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

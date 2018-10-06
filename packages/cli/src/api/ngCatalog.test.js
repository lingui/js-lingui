import mockFs from "mock-fs"
import { mockConfig } from "@lingui/jest-mocks"

import { getCatalogs, Catalog } from "./ngCatalog"

describe("getCatalogs", function() {
  afterEach(() => {
    mockFs.restore()
  })

  it("should get single catalog if catalogPath doesn't include {name} pattern", function() {
    expect(
      getCatalogs(
        mockConfig({
          catalogs: {
            "./src/locales/{locale}": "./src/"
          }
        })
      )
    ).toEqual([
      new Catalog({
        name: null,
        path: "src/locales/{locale}",
        include: ["src/"],
        exclude: []
      })
    ])

    // with catalog name and excluded directories
    expect(
      getCatalogs(
        mockConfig({
          catalogs: {
            "src/locales/{locale}/all": [
              "src/",
              "/absolute/path/",
              "!node_modules/"
            ]
          }
        })
      )
    ).toEqual([
      new Catalog({
        name: "all",
        path: "src/locales/{locale}/all",
        include: ["src/", "/absolute/path/"],
        exclude: ["node_modules/"]
      })
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

    expect(
      getCatalogs(
        mockConfig({
          catalogs: {
            "{name}/locales/{locale}": "./{name}/"
          }
        })
      )
    ).toEqual([
      new Catalog({
        name: "componentA",
        path: "componentA/locales/{locale}",
        include: ["componentA/"],
        exclude: []
      }),
      new Catalog({
        name: "componentB",
        path: "componentB/locales/{locale}",
        include: ["componentB/"],
        exclude: []
      })
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

    expect(
      getCatalogs(
        mockConfig({
          catalogs: {
            "./{name}/locales/{locale}": ["./{name}/", "!componentB/"]
          }
        })
      )
    ).toEqual([
      new Catalog({
        name: "componentA",
        path: "componentA/locales/{locale}",
        include: ["componentA/"],
        exclude: ["componentB/"]
      })
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

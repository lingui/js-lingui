import mockFs from "mock-fs"
import {
  getCatalogForFile,
  getCatalogForMerge,
  getCatalogs,
} from "./getCatalogs"
import { Catalog } from "../catalog"
import { LinguiConfig, makeConfig } from "@lingui/conf"
import path from "path"

function mockConfig(config: Partial<LinguiConfig> = {}) {
  return makeConfig(
    {
      rootDir: path.join(__dirname, "fixtures"),
      locales: ["en", "pl"],
      ...config,
    },
    { skipValidation: true }
  )
}

describe("getCatalogs", () => {
  afterEach(() => {
    mockFs.restore()
  })

  it("should get single catalog if catalogPath doesn't include {name} pattern", () => {
    const config = mockConfig({
      catalogs: [
        {
          path: "./src/locales/{locale}",
          include: ["./src/"],
        },
      ],
    })
    expect(getCatalogs(config)).toEqual([
      new Catalog(
        {
          name: null,
          path: "src/locales/{locale}",
          include: ["src/"],
          exclude: [],
        },
        config
      ),
    ])
  })

  it("should have catalog name and ignore patterns", () => {
    const config = mockConfig({
      catalogs: [
        {
          path: "src/locales/{locale}/all",
          include: ["src/", "/absolute/path/"],
          exclude: ["node_modules/"],
        },
      ],
    })
    expect(getCatalogs(config)).toEqual([
      new Catalog(
        {
          name: "all",
          path: "src/locales/{locale}/all",
          include: ["src/", "/absolute/path/"],
          exclude: ["node_modules/"],
        },
        config
      ),
    ])
  })

  it("should expand {name} for matching directories", () => {
    mockFs({
      componentA: {
        "index.js": mockFs.file(),
      },
      componentB: {
        "index.js": mockFs.file(),
      },
    })

    const config = mockConfig({
      catalogs: [
        {
          path: "{name}/locales/{locale}",
          include: ["./{name}/"],
        },
      ],
    })
    expect(getCatalogs(config)).toEqual([
      new Catalog(
        {
          name: "componentA",
          path: "componentA/locales/{locale}",
          include: ["componentA/"],
          exclude: [],
        },
        config
      ),
      new Catalog(
        {
          name: "componentB",
          path: "componentB/locales/{locale}",
          include: ["componentB/"],
          exclude: [],
        },
        config
      ),
    ])
  })

  it("should expand {name} multiple times in path", () => {
    mockFs({
      componentA: {
        "index.js": mockFs.file(),
      },
    })

    const config = mockConfig({
      catalogs: [
        {
          path: "{name}/locales/{locale}/{name}_messages_{locale}",
          include: ["./{name}/"],
        },
      ],
    })
    expect(getCatalogs(config)).toEqual([
      new Catalog(
        {
          name: "componentA",
          path: "componentA/locales/{locale}/componentA_messages_{locale}",
          include: ["componentA/"],
          exclude: [],
        },
        config
      ),
    ])
  })

  it("shouldn't expand {name} for ignored directories", () => {
    mockFs({
      componentA: {
        "index.js": mockFs.file(),
      },
      componentB: {
        "index.js": mockFs.file(),
      },
    })

    const config = mockConfig({
      catalogs: [
        {
          path: "./{name}/locales/{locale}",
          include: ["./{name}/"],
          exclude: ["componentB/"],
        },
      ],
    })
    expect(getCatalogs(config)).toEqual([
      new Catalog(
        {
          name: "componentA",
          path: "componentA/locales/{locale}",
          include: ["componentA/"],
          exclude: ["componentB/"],
        },
        config
      ),
    ])
  })

  it("should warn if catalogPath is a directory", () => {
    expect(() =>
      getCatalogs(
        mockConfig({
          catalogs: [
            {
              path: "./locales/{locale}/",
              include: ["."],
            },
          ],
        })
      )
    ).toThrowErrorMatchingSnapshot()

    // Use values from config in error message
    expect(() =>
      getCatalogs(
        mockConfig({
          locales: ["cs"],
          format: "minimal",
          catalogs: [
            {
              path: "./locales/{locale}/",
              include: ["."],
            },
          ],
        })
      )
    ).toThrowErrorMatchingSnapshot()
  })

  it("should warn about missing {name} pattern in catalog path", () => {
    expect(() =>
      getCatalogs(
        mockConfig({
          catalogs: [
            {
              path: "./locales/{locale}",
              include: ["./{name}/"],
            },
          ],
        })
      )
    ).toThrowErrorMatchingSnapshot()
  })
})

describe("getCatalogForMerge", () => {
  afterEach(() => {
    mockFs.restore()
  })

  it("should return catalog for merged messages", () => {
    const config = mockConfig({
      catalogsMergePath: "locales/{locale}",
    })
    expect(getCatalogForMerge(config)).toEqual(
      new Catalog(
        {
          name: null,
          path: "locales/{locale}",
          include: [],
          exclude: [],
        },
        config
      )
    )
  })

  it("should return catalog with custom name for merged messages", () => {
    const config = mockConfig({
      catalogsMergePath: "locales/{locale}/my/dir",
    })
    expect(getCatalogForMerge(config)).toEqual(
      new Catalog(
        {
          name: "dir",
          path: "locales/{locale}/my/dir",
          include: [],
          exclude: [],
        },
        config
      )
    )
  })

  it("should throw error if catalogsMergePath ends with slash", () => {
    const config = mockConfig({
      catalogsMergePath: "locales/{locale}/bad/path/",
    })
    expect.assertions(1)
    try {
      getCatalogForMerge(config)
    } catch (e) {
      expect((e as Error).message).toBe(
        'Remove trailing slash from "locales/{locale}/bad/path/". Catalog path isn\'t a directory, but translation file without extension. For example, catalog path "locales/{locale}/bad/path" results in translation file "locales/en/bad/path.po".'
      )
    }
  })

  it("should throw error if {locale} is omitted from catalogsMergePath", () => {
    const config = mockConfig({
      catalogsMergePath: "locales/bad/path",
    })
    expect.assertions(1)
    try {
      getCatalogForMerge(config)
    } catch (e) {
      expect((e as Error).message).toBe(
        "Invalid catalog path: {locale} variable is missing"
      )
    }
  })
})
describe("getCatalogForFile", () => {
  it("should return null if catalog cannot be found", () => {
    const catalogs = [
      new Catalog(
        {
          name: null,
          path: "./src/locales/{locale}",
          include: ["./src/"],
        },
        mockConfig()
      ),
    ]

    expect(getCatalogForFile("./xyz/en.po", catalogs)).toBeNull()
  })

  it("should return matching catalog and locale if {locale} is present multiple times in path", () => {
    const catalog = new Catalog(
      {
        name: null,
        path: "./src/locales/{locale}/messages_{locale}",
        include: ["./src/"],
      },
      mockConfig({ format: "po", rootDir: "." })
    )
    const catalogs = [catalog]

    expect(
      getCatalogForFile("./src/locales/en/messages_en.po", catalogs)
    ).toEqual({
      locale: "en",
      catalog,
    })
  })

  it("should return matching catalog and locale", () => {
    const catalog = new Catalog(
      {
        name: null,
        path: "./src/locales/{locale}",
        include: ["./src/"],
      },
      mockConfig({ format: "po", rootDir: "." })
    )
    const catalogs = [catalog]

    expect(getCatalogForFile("./src/locales/en.po", catalogs)).toEqual({
      locale: "en",
      catalog,
    })
  })

  it("should work with Windows path delimiters", () => {
    const catalog = new Catalog(
      {
        name: null,
        path: ".\\src\\locales\\{locale}",
        include: ["./src/"],
      },
      mockConfig({ format: "po", rootDir: "." })
    )
    const catalogs = [catalog]

    expect(getCatalogForFile("src\\locales\\en.po", catalogs)).toEqual({
      locale: "en",
      catalog,
    })
  })
})

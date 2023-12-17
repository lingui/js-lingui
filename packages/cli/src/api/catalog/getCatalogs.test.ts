import mockFs from "mock-fs"
import {
  getCatalogForFile,
  getCatalogForMerge,
  getCatalogs,
} from "./getCatalogs"
import { Catalog } from "../catalog"
import { LinguiConfig, makeConfig } from "@lingui/conf"
import path from "path"
import { getFormat } from "@lingui/cli/api"
import { FormatterWrapper } from "../formats"

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
  let format: FormatterWrapper

  beforeAll(async () => {
    format = await getFormat("po", {}, "en")
  })

  afterEach(() => {
    mockFs.restore()
  })

  it("should get single catalog if catalogPath doesn't include {name} pattern", async () => {
    const config = mockConfig({
      catalogs: [
        {
          path: "./src/locales/{locale}",
          include: ["./src/"],
        },
      ],
    })
    expect(cleanCatalog((await getCatalogs(config))[0])).toEqual(
      cleanCatalog(
        new Catalog(
          {
            name: null,
            path: "src/locales/{locale}",
            include: ["src/"],
            exclude: [],
            format,
          },
          config
        )
      )
    )
  })

  it("should have catalog name and ignore patterns", async () => {
    const config = mockConfig({
      catalogs: [
        {
          path: "src/locales/{locale}/all",
          include: ["src/", "/absolute/path/"],
          exclude: ["node_modules/"],
        },
      ],
    })
    expect(cleanCatalog((await getCatalogs(config))[0])).toEqual(
      cleanCatalog(
        new Catalog(
          {
            name: "all",
            path: "src/locales/{locale}/all",
            include: ["src/", "/absolute/path/"],
            exclude: ["node_modules/"],
            format,
          },
          config
        )
      )
    )
  })

  it("should expand {name} for matching directories", async () => {
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

    const catalogs = await getCatalogs(config)

    expect([cleanCatalog(catalogs[0]), cleanCatalog(catalogs[1])]).toEqual([
      cleanCatalog(
        new Catalog(
          {
            name: "componentA",
            path: "componentA/locales/{locale}",
            include: ["componentA/"],
            exclude: [],
            format,
          },
          config
        )
      ),
      cleanCatalog(
        new Catalog(
          {
            name: "componentB",
            path: "componentB/locales/{locale}",
            include: ["componentB/"],
            exclude: [],
            format,
          },
          config
        )
      ),
    ])
  })

  it("should expand {name} multiple times in path", async () => {
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
    expect(cleanCatalog((await getCatalogs(config))[0])).toEqual(
      cleanCatalog(
        new Catalog(
          {
            name: "componentA",
            path: "componentA/locales/{locale}/componentA_messages_{locale}",
            include: ["componentA/"],
            exclude: [],
            format,
          },
          config
        )
      )
    )
  })

  it("shouldn't expand {name} for ignored directories", async () => {
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
    expect(cleanCatalog((await getCatalogs(config))[0])).toEqual(
      cleanCatalog(
        new Catalog(
          {
            name: "componentA",
            path: "componentA/locales/{locale}",
            include: ["componentA/"],
            exclude: ["componentB/"],
            format,
          },
          config
        )
      )
    )
  })

  it("should warn if catalogPath is a directory", async () => {
    await expect(
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
    ).rejects.toMatchSnapshot()

    // Use values from config in error message
    await expect(
      getCatalogs(
        mockConfig({
          locales: ["cs"],
          catalogs: [
            {
              path: "./locales/{locale}/",
              include: ["."],
            },
          ],
        })
      )
    ).rejects.toMatchSnapshot()
  })

  it("should warn about missing {name} pattern in catalog path", async () => {
    await expect(
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
    ).rejects.toMatchSnapshot()
  })
})

// remove non-serializable properties, which are not subject of a test
function cleanCatalog(catalog: Catalog) {
  delete catalog.config
  delete catalog.format
  return catalog
}
describe("getCatalogForMerge", () => {
  let format: FormatterWrapper

  beforeAll(async () => {
    format = await getFormat("po", {}, "en")
  })

  afterEach(() => {
    mockFs.restore()
  })

  it("should return catalog for merged messages", async () => {
    const config = mockConfig({
      catalogsMergePath: "locales/{locale}",
    })
    expect(cleanCatalog(await getCatalogForMerge(config))).toEqual(
      cleanCatalog(
        new Catalog(
          {
            name: null,
            path: "locales/{locale}",
            include: [],
            exclude: [],
            format,
          },
          config
        )
      )
    )
  })

  it("should return catalog with custom name for merged messages", async () => {
    const config = mockConfig({
      catalogsMergePath: "locales/{locale}/my/dir",
    })
    expect(cleanCatalog(await getCatalogForMerge(config))).toStrictEqual(
      cleanCatalog(
        new Catalog(
          {
            name: "dir",
            path: "locales/{locale}/my/dir",
            include: [],
            exclude: [],
            format,
          },
          config
        )
      )
    )
  })

  it("should throw error if catalogsMergePath ends with slash", async () => {
    const config = mockConfig({
      catalogsMergePath: "locales/{locale}/bad/path/",
    })
    expect.assertions(1)
    try {
      await getCatalogForMerge(config)
    } catch (e) {
      expect((e as Error).message).toBe(
        'Remove trailing slash from "locales/{locale}/bad/path/". Catalog path isn\'t a directory, but translation file without extension. For example, catalog path "locales/{locale}/bad/path" results in translation file "locales/en/bad/path.po".'
      )
    }
  })

  it("should throw error if {locale} is omitted from catalogsMergePath", async () => {
    const config = mockConfig({
      catalogsMergePath: "locales/bad/path",
    })
    expect.assertions(1)
    try {
      await getCatalogForMerge(config)
    } catch (e) {
      expect((e as Error).message).toBe(
        "Invalid catalog path: {locale} variable is missing"
      )
    }
  })
})
describe("getCatalogForFile", () => {
  let format: FormatterWrapper

  beforeAll(async () => {
    format = await getFormat("po", {}, "en")
  })

  it("should return null if catalog cannot be found", () => {
    const catalogs = [
      new Catalog(
        {
          name: null,
          path: "./src/locales/{locale}",
          include: ["./src/"],
          format,
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
        format,
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
        format,
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
        format,
      },
      mockConfig({ format: "po", rootDir: "." })
    )
    const catalogs = [catalog]

    expect(getCatalogForFile("src\\locales\\en.po", catalogs)).toEqual({
      locale: "en",
      catalog,
    })
  })

  it("should allow parentheses in path names", async () => {
    const catalog = new Catalog(
      {
        name: null,
        path: "./src/locales/(asd)/{locale}",
        include: ["./src/"],
        format,
      },
      mockConfig({ format: "po", rootDir: "." })
    )
    const catalogs = [catalog]

    expect(getCatalogForFile("./src/locales/(asd)/en.po", catalogs)).toEqual({
      locale: "en",
      catalog,
    })
  })
})

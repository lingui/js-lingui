import fs from "fs"
import path from "path"
import mockFs from "mock-fs"
import { mockConsole } from "@lingui/jest-mocks"
import { LinguiConfig, makeConfig } from "@lingui/conf"

import { Catalog, cleanObsolete, order, CatalogProps } from "./catalog"
import { createCompiledCatalog } from "./compile"

import {
  copyFixture,
  defaultMakeOptions,
  defaultMakeTemplateOptions,
  makeNextMessage,
  defaultMergeOptions,
  makeCatalog,
} from "../tests"
import { AllCatalogsType } from "./types"

export const fixture = (...dirs: string[]) =>
  path.resolve(__dirname, path.join("fixtures", ...dirs)) +
  // preserve trailing slash
  (dirs[dirs.length - 1].endsWith("/") ? "/" : "")

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

describe("Catalog", () => {
  afterEach(() => {
    mockFs.restore()
  })

  describe("make", () => {
    it("should collect and write catalogs", async () => {
      const localeDir = await copyFixture(fixture("locales", "initial"))
      const catalog = new Catalog(
        {
          name: "messages",
          path: path.join(localeDir, "{locale}", "messages"),
          include: [
            fixture("collect/componentA/"),
            fixture("collect/componentB"),
          ],
          exclude: [],
        },
        mockConfig({
          locales: ["en", "cs"],
        })
      )

      // Everything should be empty
      expect(catalog.readAll()).toMatchSnapshot()

      await catalog.make(defaultMakeOptions)
      expect(catalog.readAll()).toMatchSnapshot()
    })

    it("should only update the specified locale", async () => {
      const localeDir = await copyFixture(fixture("locales", "initial"))
      const catalog = new Catalog(
        {
          name: "messages",
          path: path.join(localeDir, "{locale}", "messages"),
          include: [
            fixture("collect/componentA/"),
            fixture("collect/componentB"),
          ],
          exclude: [],
        },
        mockConfig({
          locales: ["en", "cs"],
        })
      )

      // Everything should be empty
      expect(catalog.readAll()).toMatchSnapshot()

      await catalog.make({ ...defaultMakeOptions, locale: "en" })
      expect(catalog.readAll()).toMatchSnapshot()
    })

    it("should merge with existing catalogs", async () => {
      const localeDir = await copyFixture(fixture("locales", "existing"))
      const catalog = new Catalog(
        {
          name: "messages",
          path: path.join(localeDir, "{locale}"),
          include: [fixture("collect/")],
          exclude: [],
        },
        mockConfig({
          locales: ["en", "cs"],
        })
      )

      // Everything should be empty
      expect(catalog.readAll()).toMatchSnapshot()

      await catalog.make(defaultMakeOptions)
      expect(catalog.readAll()).toMatchSnapshot()
    })
  })

  describe("makeTemplate", () => {
    it("should collect and write a template", async () => {
      const localeDir = await copyFixture(fixture("locales", "initial"))
      const catalog = new Catalog(
        {
          name: "messages",
          path: path.join(localeDir, "{locale}", "messages"),
          include: [
            fixture("collect/componentA/"),
            fixture("collect/componentB"),
          ],
          exclude: [],
        },
        mockConfig({
          locales: ["en", "cs"],
        })
      )

      // Everything should be empty
      expect(catalog.readTemplate()).toMatchSnapshot()

      await catalog.makeTemplate(defaultMakeTemplateOptions)
      expect(catalog.readTemplate()).toMatchSnapshot()
    })
  })

  describe("POT Flow", () => {
    it("Should get translations from template if locale file not presented", () => {
      const catalog = new Catalog(
        {
          name: "messages",
          path: path.resolve(
            __dirname,
            path.join("fixtures", "pot-template", "{locale}")
          ),
          include: [],
          exclude: [],
        },
        mockConfig({
          locales: ["en", "pl"],
        })
      )

      const translations = catalog.getTranslations("en", {
        sourceLocale: "en",
        fallbackLocales: {
          default: "en",
        },
      })

      expect(translations).toMatchSnapshot()
    })
  })

  describe("collect", () => {
    it("should support JSX and Typescript", async () => {
      const catalog = new Catalog(
        {
          name: "messages",
          path: "locales/{locale}",
          include: [fixture("collect-typescript-jsx/")],
          exclude: [],
        },
        mockConfig()
      )

      const messages = await catalog.collect()
      expect(messages).toBeTruthy()
      expect(messages).toMatchSnapshot()
    })

    it("should support Flow syntax if enabled", async () => {
      process.env.LINGUI_CONFIG = path.join(
        __dirname,
        "fixtures/collect-syntax-flow/lingui.config.js"
      )
      const catalog = new Catalog(
        {
          name: "messages",
          path: "locales/{locale}",
          include: [fixture("collect-syntax-flow/")],
          exclude: [],
        },
        mockConfig({
          extractorParserOptions: {
            flow: true,
          },
        })
      )

      const messages = await catalog.collect()
      expect(messages).toBeTruthy()
      expect(messages).toMatchSnapshot()
    })
    it("should extract messages from source files", async () => {
      const catalog = new Catalog(
        {
          name: "messages",
          path: "locales/{locale}",
          include: [fixture("collect/")],
          exclude: [],
        },
        mockConfig()
      )

      const messages = await catalog.collect()
      expect(messages).toMatchSnapshot()
    })

    it("should respect inline sourcemaps", async () => {
      const catalog = new Catalog(
        {
          name: "messages",
          path: "locales/{locale}",
          include: [fixture("collect-inline-sourcemaps/")],
          exclude: [],
        },
        mockConfig()
      )

      const messages = await catalog.collect()
      expect(messages[Object.keys(messages)[0]].origin).toStrictEqual([
        ["../../../../../input.tsx", 5],
      ])
    })

    it("should extract only files passed on options", async () => {
      const catalog = new Catalog(
        {
          name: "messages",
          path: "locales/{locale}",
          include: [
            fixture("collect/componentA"),
            fixture("collect/componentB.js"),
          ],
          exclude: [],
        },
        mockConfig()
      )

      const messages = await catalog.collect({
        files: [fixture("collect/componentA")],
      })
      expect(messages).toMatchSnapshot()
    })

    it("should throw an error when duplicate identifier with different defaults found", async () => {
      const catalog = new Catalog(
        {
          name: "messages",
          path: "locales/{locale}",
          include: [fixture("duplicate-id.js")],
          exclude: [],
        },
        mockConfig()
      )
      expect.assertions(1)
      await mockConsole(async (console) => {
        await catalog.collect({
          files: [fixture("duplicate-id.js")],
        })

        expect(console.error).toBeCalledWith(
          expect.stringContaining(
            `Encountered different default translations for message`
          )
        )
      })
    })

    it("should handle syntax errors", async () => {
      const catalog = new Catalog(
        {
          name: "messages",
          path: "locales/{locale}",
          include: [fixture("collect-invalid/")],
          exclude: [],
        },
        mockConfig()
      )

      expect.assertions(2)
      await mockConsole(async (console) => {
        const messages = await catalog.collect()
        expect(console.error).toBeCalledWith(
          expect.stringContaining(`Cannot process file`)
        )
        expect(messages).toBeFalsy()
      })
    })
  })
  it("Catalog.merge should initialize catalogs", () => {
    const prevCatalogs: AllCatalogsType = { en: null, cs: null }
    const nextCatalog = {
      "custom.id": makeNextMessage({
        message: "Message with custom ID",
      }),
      "Message with <0>auto-generated</0> ID": makeNextMessage(),
    }

    expect(
      makeCatalog({ sourceLocale: "en" }).merge(
        prevCatalogs,
        nextCatalog,
        defaultMergeOptions
      )
    ).toEqual({
      // catalog for sourceLocale - translation is prefilled
      en: {
        "custom.id": expect.objectContaining({
          message: "Message with custom ID",
          translation: "Message with custom ID",
        }),
        "Message with <0>auto-generated</0> ID": expect.objectContaining({
          translation: "Message with <0>auto-generated</0> ID",
        }),
      },
      // catalog for other than sourceLocale - translation is empty
      cs: {
        "custom.id": expect.objectContaining({
          message: "Message with custom ID",
          translation: "",
        }),
        "Message with <0>auto-generated</0> ID": expect.objectContaining({
          translation: "",
        }),
      },
    })
  })

  describe("read", () => {
    it("should return null if file does not exist", () => {
      // mock empty filesystem
      mockFs()

      const catalog = new Catalog(
        {
          name: "messages",
          path: "locales/{locale}",
          include: [],
          exclude: [],
        },
        mockConfig()
      )

      const messages = catalog.read("en")
      expect(messages).toBeNull()
    })

    it("should read file in given format", () => {
      mockFs({
        en: {
          "messages.po": fs.readFileSync(
            path.resolve(__dirname, "formats/fixtures/messages.po")
          ),
        },
      })
      const catalog = new Catalog(
        {
          name: "messages",
          path: "{locale}/messages",
          include: [],
        },
        mockConfig()
      )

      const messages = catalog.read("en")

      mockFs.restore()
      expect(messages).toMatchSnapshot()
    })

    it("should read file in previous format", () => {
      mockFs({
        en: {
          "messages.json": fs.readFileSync(
            path.resolve(__dirname, "formats/fixtures/messages.json")
          ),
        },
      })
      const catalog = new Catalog(
        {
          name: "messages",
          path: "{locale}/messages",
          include: [],
        },
        mockConfig({ prevFormat: "minimal" })
      )

      const messages = catalog.read("en")

      mockFs.restore()
      expect(messages).toMatchSnapshot()
    })
  })

  describe("readAll", () => {
    it("should read existing catalogs for all locales", () => {
      const catalog = new Catalog(
        {
          name: "messages",
          path: path.resolve(
            __dirname,
            path.join("fixtures", "readAll", "{locale}", "messages")
          ),
          include: [],
        },
        mockConfig({
          locales: ["en", "cs"],
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
  it.skip("should convert catalog format", () => {
    mockFs({
      en: {
        "messages.json": fs.readFileSync(
          path.resolve(__dirname, "formats/fixtures/messages.json")
        ),
        "messages.po": mockFs.file(),
      },
    })

    const fileContent = (format: string) =>
      fs
        .readFileSync("./en/messages." + (format === "po" ? "po" : "json"))
        .toString()
        .trim()

    const catalogConfig: CatalogProps = {
      name: "messages",
      path: "{locale}/messages",
      include: [],
    }

    const originalJson = fileContent("json")
    const po2json = new Catalog(
      catalogConfig,
      mockConfig({
        format: "po",
        prevFormat: "minimal",
      })
    )
    po2json.write("en", po2json.read("en"))
    const convertedPo = fileContent("po")

    const json2po = new Catalog(
      catalogConfig,
      mockConfig({
        format: "minimal",
        prevFormat: "po",
        localeDir: ".",
      })
    )
    json2po.write("en", json2po.read("en"))
    const convertedJson = fileContent("json")

    mockFs.restore()
    expect(originalJson).toEqual(convertedJson)
    expect(convertedPo).toMatchSnapshot()
  })
})

describe("cleanObsolete", () => {
  it("should remove obsolete messages from catalog", () => {
    const catalog = {
      Label: makeNextMessage({
        translation: "Label",
      }),
      PreviousLabel: makeNextMessage({
        obsolete: true,
      }),
    }

    expect(cleanObsolete(catalog)).toMatchSnapshot()
  })
})

describe("order", () => {
  it("should order messages alphabetically", () => {
    const catalog = {
      LabelB: makeNextMessage({
        translation: "B",
      }),
      LabelA: makeNextMessage({
        translation: "A",
      }),
      LabelD: makeNextMessage({
        translation: "D",
      }),
      LabelC: makeNextMessage({
        translation: "C",
      }),
    }

    const orderedCatalogs = order("messageId")(catalog)

    // Test that the message content is the same as before
    expect(orderedCatalogs).toMatchSnapshot()

    // Jest snapshot order the keys automatically, so test that the key order explicitly
    expect(Object.keys(orderedCatalogs)).toMatchSnapshot()
  })

  it("should order messages by origin", () => {
    const catalog = {
      LabelB: makeNextMessage({
        translation: "B",
        origin: [
          ["file2.js", 2],
          ["file1.js", 2],
        ],
      }),
      LabelA: makeNextMessage({
        translation: "A",
        origin: [["file2.js", 3]],
      }),
      LabelD: makeNextMessage({
        translation: "D",
        origin: [["file2.js", 100]],
      }),
      LabelC: makeNextMessage({
        translation: "C",
        origin: [["file1.js", 1]],
      }),
    }

    const orderedCatalogs = order("origin")(catalog)

    // Test that the message content is the same as before
    expect(orderedCatalogs).toMatchSnapshot()

    // Jest snapshot order the keys automatically, so test that the key order explicitly
    expect(Object.keys(orderedCatalogs)).toMatchSnapshot()
  })
})

describe("writeCompiled", () => {
  let catalog: Catalog

  beforeAll(async () => {
    const localeDir = await copyFixture(fixture("locales", "initial/"))
    catalog = new Catalog(
      {
        name: "messages",
        path: path.join(localeDir, "{locale}", "messages"),
        include: [],
        exclude: [],
      },
      mockConfig()
    )
  })

  it.each([
    { namespace: "es", extension: /\.mjs$/ },
    { namespace: "ts", extension: /\.ts$/ },
    { namespace: undefined, extension: /\.js$/ },
    { namespace: "cjs", extension: /\.js$/ },
    { namespace: "window.test", extension: /\.js$/ },
    { namespace: "global.test", extension: /\.js$/ },
  ])(
    "Should save namespace $namespace in $extension extension",
    ({ namespace, extension }) => {
      const compiledCatalog = createCompiledCatalog("en", {}, { namespace })
      // Test that the file extension of the compiled catalog is `.mjs`
      expect(catalog.writeCompiled("en", compiledCatalog, namespace)).toMatch(
        extension
      )
    }
  )
})

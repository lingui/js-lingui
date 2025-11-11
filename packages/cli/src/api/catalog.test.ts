import fs from "fs"
import path from "path"
import mockFs from "mock-fs"
import { mockConsole } from "@lingui/jest-mocks"
import { LinguiConfig, makeConfig } from "@lingui/conf"

import { Catalog, cleanObsolete, order, writeCompiled } from "./catalog.js"
import { createCompiledCatalog } from "./compile.js"

import {
  copyFixture,
  defaultMakeOptions,
  defaultMakeTemplateOptions,
  makeNextMessage,
  defaultMergeOptions,
  makeCatalog,
} from "../tests.js"
import { AllCatalogsType } from "./types.js"
import { extractFromFiles } from "./catalog/extractFromFiles.js"
import { FormatterWrapper, getFormat } from "./formats/index.js"

export const fixture = (...dirs: string[]) =>
  (
    path.resolve(__dirname, path.join("fixtures", ...dirs)) +
    // preserve trailing slash
    (dirs[dirs.length - 1].endsWith("/") ? "/" : "")
  ).replace(/\\/g, "/")

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
  let format: FormatterWrapper

  beforeAll(async () => {
    format = await getFormat("po", {}, "en")
  })

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
          format,
        },
        mockConfig({
          locales: ["en", "cs"],
        })
      )

      // Everything should be empty
      expect(await catalog.readAll()).toMatchSnapshot()

      await catalog.make(defaultMakeOptions)
      expect(await catalog.readAll()).toMatchSnapshot()
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
          format,
        },
        mockConfig({
          locales: ["en", "cs"],
        })
      )

      // Everything should be empty
      expect(await catalog.readAll()).toMatchSnapshot()

      await catalog.make({ ...defaultMakeOptions, locale: ["en"] })
      expect(await catalog.readAll()).toMatchSnapshot()
    })

    it("should merge with existing catalogs", async () => {
      const localeDir = await copyFixture(fixture("locales", "existing"))
      const catalog = new Catalog(
        {
          name: "messages",
          path: path.join(localeDir, "{locale}"),
          include: [fixture("collect/")],
          exclude: [],
          format,
        },
        mockConfig({
          locales: ["en", "cs"],
        })
      )

      // Everything should be empty
      expect(await catalog.readAll()).toMatchSnapshot()

      await catalog.make(defaultMakeOptions)
      expect(await catalog.readAll()).toMatchSnapshot()
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
          format,
        },
        mockConfig({
          locales: ["en", "cs"],
        })
      )

      // Everything should be empty
      expect(await catalog.readTemplate()).toMatchSnapshot()

      await catalog.makeTemplate(defaultMakeTemplateOptions)
      expect(await catalog.readTemplate()).toMatchSnapshot()
    })
  })

  describe("POT Flow", () => {
    it("Should get translations from template if locale file not presented", async () => {
      const catalog = new Catalog(
        {
          name: "messages",
          path: path.resolve(
            __dirname,
            path.join("fixtures", "pot-template", "{locale}")
          ),
          include: [],
          exclude: [],
          format,
        },
        mockConfig({
          locales: ["en", "pl"],
        })
      )

      const translations = await catalog.getTranslations("en", {
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
      const messages = await extractFromFiles(
        [
          fixture("collect-typescript-jsx/jsx-in-js.js"),
          fixture("collect-typescript-jsx/jsx-syntax.jsx"),
          fixture("collect-typescript-jsx/tsx-syntax.tsx"),
          fixture("collect-typescript-jsx/macro.tsx"),
        ],
        mockConfig()
      )

      expect(messages).toMatchSnapshot()
    })

    it("should sort placeholders to keep them stable between runs", async () => {
      const runA = await extractFromFiles(
        [
          fixture("collect-placeholders-sorting/a.ts"),
          fixture("collect-placeholders-sorting/b.ts"),
        ],
        mockConfig()
      )

      const runB = await extractFromFiles(
        [
          fixture("collect-placeholders-sorting/b.ts"),
          fixture("collect-placeholders-sorting/a.ts"),
        ],
        mockConfig()
      )

      expect(Object.values(runA)[0].placeholders[0]).toStrictEqual(
        Object.values(runB)[0].placeholders[0]
      )

      expect(Object.values(runA)[0].placeholders).toMatchInlineSnapshot(`
        {
          0: [
            getUser(),
            getWorld(),
          ],
        }
      `)

      // expect(messages).toMatchSnapshot()
    })

    it("should support experimental typescript decorators under a flag", async () => {
      const messages = await extractFromFiles(
        [fixture("collect-typescript-jsx/tsx-experimental-decorators.tsx")],
        mockConfig({
          extractorParserOptions: {
            tsExperimentalDecorators: true,
          },
        })
      )

      expect(messages).toBeTruthy()
      expect(messages).toMatchInlineSnapshot(`
        {
          xDAtGP: {
            comments: [],
            context: undefined,
            message: Message,
            origin: [
              [
                collect-typescript-jsx/tsx-experimental-decorators.tsx,
                15,
              ],
            ],
            placeholders: {},
          },
        }
      `)
    })

    it("should support Flow syntax if enabled", async () => {
      const catalog = new Catalog(
        {
          name: "messages",
          path: "locales/{locale}",
          include: [fixture("collect-syntax-flow/")],
          exclude: [],
          format,
        },
        mockConfig({
          extractorParserOptions: {
            flow: true,
          },
        })
      )

      const messages = await catalog.collect()
      expect(messages).toMatchSnapshot()
    })
    it("should extract messages from source files", async () => {
      const catalog = new Catalog(
        {
          name: "messages",
          path: "locales/{locale}",
          include: [fixture("collect/")],
          exclude: [],
          format,
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
          format,
        },
        mockConfig()
      )

      const messages = await catalog.collect()
      expect(messages[Object.keys(messages)[0]].origin).toMatchInlineSnapshot(`
        [
          [
            ../../../input.tsx,
            5,
          ],
        ]
      `)
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
          format,
        },
        mockConfig()
      )

      const messages = await catalog.collect({
        files: [fixture("collect/componentA")],
      })
      expect(messages).toMatchSnapshot()
    })

    it("should extract files with special characters when passed in options", async () => {
      const catalog = new Catalog(
        {
          name: "messages",
          path: "locales/{locale}",
          include: [fixture("collect")],
          exclude: [],
          format,
        },
        mockConfig()
      )

      const messages = await catalog.collect({
        files: [
          fixture("collect/(componentC)/index.js"),
          fixture("collect/[componentD]/index.js"),
          fixture("collect/$componentE/index.js"),
        ],
      })
      expect(messages).toMatchSnapshot()
    })

    it("should extract files with special characters in the include path", async () => {
      const catalog = new Catalog(
        {
          name: "messages",
          path: "locales/{locale}",
          include: [fixture("collect/[componentD]")],
          exclude: [],
          format,
        },
        mockConfig()
      )
      const messages = await catalog.collect()
      expect(messages).toMatchSnapshot()
    })

    it("should throw an error when duplicate identifier with different defaults found", async () => {
      const catalog = new Catalog(
        {
          name: "messages",
          path: "locales/{locale}",
          include: [fixture("duplicate-id.js")],
          exclude: [],
          format,
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
          format,
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
  it("Catalog.merge should initialize catalogs", async () => {
    const prevCatalogs: AllCatalogsType = { en: null, cs: null }
    const nextCatalog = {
      "custom.id": makeNextMessage({
        message: "Message with custom ID",
      }),
      "Message with <0>auto-generated</0> ID": makeNextMessage(),
    }

    expect(
      (await makeCatalog({ sourceLocale: "en" })).merge(
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
    it("should return null if file does not exist", async () => {
      // mock empty filesystem
      mockFs()

      const catalog = new Catalog(
        {
          name: "messages",
          path: "locales/{locale}",
          include: [],
          exclude: [],
          format,
        },
        mockConfig()
      )

      const messages = await catalog.read("en")
      expect(messages).toBeNull()
    })

    it("should read file in given format", async () => {
      mockFs({
        en: {
          "messages.po": fs.readFileSync(
            path.resolve(__dirname, "fixtures/messages.po")
          ),
        },
      })
      const catalog = new Catalog(
        {
          name: "messages",
          path: "{locale}/messages",
          include: [],
          format,
        },
        mockConfig()
      )

      const messages = await catalog.read("en")

      mockFs.restore()
      expect(messages).toMatchSnapshot()
    })

    it.skip("should read file in previous format", async () => {
      mockFs({
        en: {
          "messages.json": fs.readFileSync(
            path.resolve(__dirname, "fixtures/messages.json")
          ),
        },
      })
      const catalog = new Catalog(
        {
          name: "messages",
          path: "{locale}/messages",
          include: [],
          format,
        },
        mockConfig({ prevFormat: "minimal" })
      )

      const messages = await catalog.read("en")

      mockFs.restore()
      expect(messages).toMatchSnapshot()
    })
  })

  describe("readAll", () => {
    it("should read existing catalogs for all locales", async () => {
      const catalog = new Catalog(
        {
          name: "messages",
          path: path.resolve(
            __dirname,
            path.join("fixtures", "readAll", "{locale}", "messages")
          ),
          include: [],
          format,
        },
        mockConfig({
          locales: ["en", "cs"],
        })
      )

      const messages = await catalog.readAll()
      expect(messages).toMatchSnapshot()
    })
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

    const orderedCatalogs = order("messageId", catalog)

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

    const orderedCatalogs = order("origin", catalog)

    // Test that the message content is the same as before
    expect(orderedCatalogs).toMatchSnapshot()

    // Jest snapshot order the keys automatically, so test that the key order explicitly
    expect(Object.keys(orderedCatalogs)).toMatchSnapshot()
  })

  it("should order messages by message and then by context", () => {
    const catalog = {
      msg1: makeNextMessage({
        message: "B",
        translation: "B",
        origin: [
          ["file2.js", 2],
          ["file1.js", 2],
        ],
      }),
      msg2: makeNextMessage({
        // message is optional.
        translation: "A",
        context: "context1",
        origin: [["file2.js", 3]],
      }),
      msg3: makeNextMessage({
        message: "D",
        translation: "D",
        origin: [["file2.js", 100]],
      }),
      msg4: makeNextMessage({
        message: "C",
        translation: "C",
        origin: [["file1.js", 1]],
      }),
      msg5: makeNextMessage({
        message: "B",
        translation: "B",
        context: "context3",
        origin: [["file2.js", 4]],
      }),
      msg6: makeNextMessage({
        message: "B",
        translation: "B",
        context: "context2",
        origin: [["file2.js", 5]],
      }),
    }

    const orderedCatalogs = order("message", catalog)

    // Jest snapshot order the keys automatically, so test that the key order explicitly
    expect(Object.keys(orderedCatalogs)).toMatchInlineSnapshot(`
      [
        msg2,
        msg1,
        msg6,
        msg5,
        msg4,
        msg3,
      ]
    `)
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
        format: await getFormat("po", {}, "en"),
      },
      mockConfig()
    )
  })

  it.each([
    { namespace: "es", extension: /\.mjs$/ },
    { namespace: "ts", extension: /\.ts$/ },
    { namespace: "json", extension: /\.json$/ },
    { namespace: undefined, extension: /\.js$/ },
    { namespace: "cjs", extension: /\.js$/ },
    { namespace: "window.test", extension: /\.js$/ },
    { namespace: "global.test", extension: /\.js$/ },
  ])(
    "Should save namespace $namespace in $extension extension",
    async ({ namespace, extension }) => {
      const { source } = createCompiledCatalog("en", {}, { namespace })
      // Test that the file extension of the compiled catalog is `.mjs`
      expect(
        await writeCompiled(catalog.path, "en", source, namespace)
      ).toMatch(extension)
    }
  )
})

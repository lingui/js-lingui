import syncProcess, {
  init,
  writeSegmentsToCatalogs,
  sync,
} from "./translationIO.js"
import { LinguiConfig, makeConfig, MessageType } from "@lingui/conf"
import fs from "fs"
import path from "path"
import { CliExtractOptions } from "../lingui-extract.js"
import {
  createFixtures,
  listingToHumanReadable,
  readFsToListing,
} from "../tests.js"
import {
  TranslationIoResponse,
  TranslationIoSegment,
} from "./translationIO/translationio-api.js"
import { setupServer } from "msw/node"
import { DefaultBodyType, http, HttpResponse, StrictRequest } from "msw"
import { getFormat } from "../api/formats/index.js"
import { Catalog } from "../api/catalog.js"
import os from "os"
import { AllCatalogsType } from "../api/types.js"
import { generateMessageId } from "@lingui/message-utils/generateMessageId"

export const mswServer = setupServer()

mswServer.listen({
  onUnhandledRequest: "error",
})

const expectVersion = expect.stringMatching(/\d+\.\d+.\d+/)

// Utility to create test config and catalogs
async function makeTestConfig(
  outputDir: string,
  configOverrides?: Partial<LinguiConfig>
) {
  const config = makeConfig({
    rootDir: outputDir,
    locales: ["en", "fr", "es"],
    sourceLocale: "en",
    format: "po",
    service: {
      name: "TranslationIO",
      apiKey: "test-api-key-123",
    },
    catalogs: [
      {
        name: "messages",
        path: path.join(outputDir, "{locale}"),
        include: [],
      },
    ],
    ...configOverrides,
  })

  const format = await getFormat(
    config.format,
    config.formatOptions,
    config.sourceLocale
  )

  const catalogs = config.catalogs.map(
    (catalog) =>
      new Catalog(
        {
          name: catalog.name,
          path: catalog.path,
          format,
          include: catalog.include,
        },
        config
      )
  )

  return { testConfig: config, catalogs }
}

// Helper to prepare test directory
async function prepareTestDir() {
  return await fs.promises.mkdtemp(
    path.join(os.tmpdir(), `test-${process.pid}`)
  )
}

function createMessage(msg: MessageType, explicitId?: string) {
  return {
    [explicitId || generateMessageId(msg.message!, msg.context)]: msg,
  }
}

// Helper to create extraction result with sample messages
function createExtractionResult(catalogs: Catalog[]) {
  const extractionResult: {
    catalog: Catalog
    messagesByLocale: AllCatalogsType
  }[] = []

  // Create extraction result for the first catalog with standard test messages
  extractionResult.push({
    catalog: catalogs[0],
    messagesByLocale: {
      en: {
        ...createMessage(
          {
            message: "Welcome to our app",
            translation: "Welcome to our app",
            origin: [["src/App.tsx", 10]],
            comments: [],
          },
          "app.welcome"
        ),
        ...createMessage({
          message: "Hello {name}",
          translation: "",
          origin: [["src/App.tsx", 15]],
        }),
        ...createMessage({
          message: "Home",
          translation: "",
          context: "navigation",
          origin: [["src/App.tsx", 20]],
        }),
        ...createMessage(
          {
            message: "About Us",
            translation: "About Us",
            context: "page.about",
            origin: [["src/About.tsx", 5]],
            comments: [],
          },
          "about.title"
        ),
      },
      fr: {
        ...createMessage(
          {
            message: "Welcome to our app",
            translation: "Bienvenue dans notre application",
            origin: [["src/App.tsx", 10]],
            comments: ["js-lingui-explicit-id"],
          },
          "app.welcome"
        ),
        ...createMessage({
          message: "Hello {name}",
          translation: "Bonjour {name}",
          origin: [["src/App.tsx", 15]],
        }),
        ...createMessage({
          message: "Home",
          translation: "Accueil",
          context: "navigation",
          origin: [["src/App.tsx", 20]],
        }),
        ...createMessage(
          {
            message: "About Us",
            translation: "À propos",
            context: "page.about",
            origin: [["src/About.tsx", 5]],
            comments: [],
          },
          "about.title"
        ),
      },
      es: {
        ...createMessage(
          {
            message: "Welcome to our app",
            translation: "",
            origin: [["src/App.tsx", 10]],
            comments: [],
          },
          "app.welcome"
        ),
        ...createMessage({
          message: "Hello {name}",
          translation: "",
          origin: [["src/App.tsx", 15]],
        }),
        ...createMessage({
          message: "Home",
          translation: "",
          context: "navigation",
          origin: [["src/App.tsx", 20]],
        }),
        ...createMessage(
          {
            message: "About Us",
            translation: "",
            context: "page.about",
            origin: [["src/About.tsx", 5]],
            comments: [],
          },
          "about.title"
        ),
      },
    },
  })

  return extractionResult
}

// Helper to create extraction result with multiple catalogs
function createMultiCatalogExtractionResult(catalogs: Catalog[]) {
  const extractionResult: {
    catalog: Catalog
    messagesByLocale: AllCatalogsType
  }[] = []

  // First catalog - messages
  extractionResult.push({
    catalog: catalogs[0],
    messagesByLocale: {
      en: {
        ...createMessage(
          {
            message: "Welcome to our app",
            translation: "",
            origin: [["src/App.tsx", 10]],
            comments: ["js-lingui-explicit-id"],
          },
          "app.welcome"
        ),
        ...createMessage({
          message: "Hello {name}",
          translation: "",
          origin: [["src/App.tsx", 15]],
        }),
        ...createMessage({
          message: "Home",
          translation: "",
          context: "navigation",
          origin: [["src/App.tsx", 20]],
        }),
        ...createMessage(
          {
            message: "About Us",
            translation: "About Us",
            context: "page.about",
            origin: [["src/About.tsx", 5]],
            comments: ["js-lingui-explicit-id"],
          },
          "about.title"
        ),
      },
      fr: {
        ...createMessage(
          {
            message: "Welcome to our app",
            translation: "Bienvenue dans notre application",
            origin: [["src/App.tsx", 10]],
            comments: ["js-lingui-explicit-id"],
          },
          "app.welcome"
        ),
        ...createMessage({
          message: "Hello {name}",
          translation: "Bonjour {name}",
          origin: [["src/App.tsx", 15]],
        }),
        ...createMessage({
          message: "Home",
          translation: "Accueil",
          context: "navigation",
          origin: [["src/App.tsx", 20]],
        }),
        ...createMessage(
          {
            message: "About Us",
            translation: "À propos",
            context: "page.about",
            origin: [["src/About.tsx", 5]],
            comments: ["js-lingui-explicit-id"],
          },
          "about.title"
        ),
      },
      es: {
        ...createMessage({
          message: "Welcome to our app",
          translation: "",
          origin: [["src/App.tsx", 10]],
          comments: ["js-lingui-explicit-id"],
        }),
        ...createMessage({
          message: "Hello {name}",
          translation: "",
          origin: [["src/App.tsx", 15]],
        }),
        ...createMessage({
          message: "Home",
          translation: "",
          context: "navigation",
          origin: [["src/App.tsx", 20]],
        }),
        ...createMessage(
          {
            message: "About Us",
            translation: "",
            context: "page.about",
            origin: [["src/About.tsx", 5]],
            comments: [],
          },
          "about.title"
        ),
      },
    },
  })

  // Second catalog - errors
  extractionResult.push({
    catalog: catalogs[1],
    messagesByLocale: {
      en: {
        ...createMessage({
          message: "Error occurred",
          translation: "",
          origin: [["src/errors.tsx", 1]],
        }),
        ...createMessage({
          message: "Not found",
          translation: "",
          origin: [["src/errors.tsx", 2]],
        }),
      },
      fr: {
        ...createMessage({
          message: "Error occurred",
          translation: "Une erreur s'est produite",
          origin: [["src/errors.tsx", 1]],
        }),

        ...createMessage({
          message: "Not found",
          translation: "Non trouvé",
          origin: [["src/errors.tsx", 2]],
        }),
      },
      es: {
        ...createMessage({
          message: "Error occurred",
          translation: "Ocurrió un error",
          origin: [["src/errors.tsx", 1]],
        }),
        ...createMessage({
          message: "Not found",
          translation: "No encontrado",
          origin: [["src/errors.tsx", 2]],
        }),
      },
    },
  })

  return extractionResult
}

describe("TranslationIO Integration", () => {
  let options: CliExtractOptions

  beforeAll(() => {
    vi.setSystemTime(new Date("2023-03-15T10:00Z"))
  })

  beforeEach(async () => {
    options = {
      verbose: false,
      clean: false,
      overwrite: false,
      locale: [],
      workersOptions: { poolSize: 0 },
    }
  })

  describe.skip("writeSegmentsToCatalogs", () => {
    it("should save segments to PO files", async () => {
      const outputDir = await prepareTestDir()
      const { testConfig, catalogs } = await makeTestConfig(outputDir)

      const extractionResult = createExtractionResult(catalogs)

      const segmentsPerLocale: { [locale: string]: TranslationIoSegment[] } = {
        fr: [
          {
            type: "source",
            source: "Hello",
            target: "Bonjour",
            context: "",
            references: ["src/App.tsx:1"],
            comment: "",
          },
          {
            type: "source",
            source: "World",
            target: "Monde",
            context: "",
            references: ["src/App.tsx:2"],
            comment: "",
          },
        ],
        es: [
          {
            type: "source",
            source: "Hello",
            target: "Hola",
            context: "",
            references: ["src/App.tsx:1"],
            comment: "",
          },
          {
            type: "source",
            source: "World",
            target: "Mundo",
            context: "",
            references: ["src/App.tsx:2"],
            comment: "",
          },
        ],
      }

      await writeSegmentsToCatalogs(
        testConfig,
        "en",
        extractionResult,
        segmentsPerLocale
      )

      // Verify content
      expect(listingToHumanReadable(readFsToListing(outputDir)))
        .toMatchInlineSnapshot(`
        #######################
        Filename: es.po
        #######################

        msgid ""
        msgstr ""
        "POT-Creation-Date: 2023-03-15 10:00+0000\\n"
        "MIME-Version: 1.0\\n"
        "Content-Type: text/plain; charset=utf-8\\n"
        "Content-Transfer-Encoding: 8bit\\n"
        "X-Generator: @lingui/cli\\n"
        "Language: es\\n"

        #: src/App.tsx:1
        msgid "Hello"
        msgstr "Hola"

        #: src/App.tsx:2
        msgid "World"
        msgstr "Mundo"


        #######################
        Filename: fr.po
        #######################

        msgid ""
        msgstr ""
        "POT-Creation-Date: 2023-03-15 10:00+0000\\n"
        "MIME-Version: 1.0\\n"
        "Content-Type: text/plain; charset=utf-8\\n"
        "Content-Transfer-Encoding: 8bit\\n"
        "X-Generator: @lingui/cli\\n"
        "Language: fr\\n"

        #: src/App.tsx:1
        msgid "Hello"
        msgstr "Bonjour"

        #: src/App.tsx:2
        msgid "World"
        msgstr "Monde"


      `)
    })

    it("should remove existing files before saving", async () => {
      const outputDir = await createFixtures({
        "fr.po": "old content",
        "fr.js": "old js content",
      })

      const { testConfig, catalogs } = await makeTestConfig(outputDir)

      const segmentsPerLocale: { [locale: string]: TranslationIoSegment[] } = {
        fr: [
          {
            type: "source",
            source: "New message",
            target: "Nouveau message",
            context: "",
            references: [],
            comment: "",
          },
        ],
      }

      const extractionResult = createExtractionResult(catalogs)

      await writeSegmentsToCatalogs(
        testConfig,
        "en",
        extractionResult,
        segmentsPerLocale
      )

      expect(listingToHumanReadable(readFsToListing(outputDir)))
        .toMatchInlineSnapshot(`
        #######################
        Filename: fr.po
        #######################

        msgid ""
        msgstr ""
        "POT-Creation-Date: 2023-03-15 10:00+0000\\n"
        "MIME-Version: 1.0\\n"
        "Content-Type: text/plain; charset=utf-8\\n"
        "Content-Transfer-Encoding: 8bit\\n"
        "X-Generator: @lingui/cli\\n"
        "Language: fr\\n"

        msgid "New message"
        msgstr "Nouveau message"


      `)
    })
  })

  describe("init", () => {
    it("should send init request with source and target segments", async () => {
      const outputDir = await prepareTestDir()
      const { testConfig, catalogs } = await makeTestConfig(outputDir)

      // Prepare extraction result manually
      const extractionResult = createExtractionResult(catalogs)

      const apiCalls: StrictRequest<DefaultBodyType>[] = []

      mswServer.use(
        http.post("https://translation.io/api/v1/*", ({ request }) => {
          apiCalls.push(request)

          return HttpResponse.json<TranslationIoResponse>({
            project: {
              name: "Test Project",
              url: "https://translation.io/test",
            },
            segments: {
              fr: [
                {
                  type: "source",
                  source: "Welcome to our app",
                  target: "Bienvenue dans notre application (updated)",
                  context: "app.welcome",
                  references: ["src/App.tsx:10"],
                  comment: "js-lingui-explicit-id",
                },
                {
                  type: "source",
                  source: "About Us",
                  target: "À propos (updated)",
                  context: "about.title",
                  references: ["src/About.tsx:5"],
                  comment: "page.about | js-lingui-explicit-id-and-context",
                },
                {
                  type: "source",
                  source: "Hello {name}",
                  target: "Bonjour {name} (updated)",
                  context: "",
                  references: ["src/App.tsx:15"],
                  comment: "",
                },
                {
                  type: "source",
                  source: "Home",
                  target: "Accueil (updated)",
                  context: "navigation",
                  references: ["src/App.tsx:20"],
                  comment: "",
                },
              ],
              es: [
                {
                  type: "source",
                  source: "Welcome to our app",
                  target: "Bienvenido a nuestra aplicación",
                  context: "app.welcome",
                  references: ["src/App.tsx:10"],
                  comment: "js-lingui-explicit-id",
                },
                {
                  type: "source",
                  source: "About Us",
                  target: "Acerca de",
                  context: "about.title",
                  references: ["src/About.tsx:5"],
                  comment: "page.about | js-lingui-explicit-id-and-context",
                },
                {
                  type: "source",
                  source: "Hello {name}",
                  target: "Hola {name}",
                  context: "",
                  references: ["src/App.tsx:15"],
                  comment: "",
                },
                {
                  type: "source",
                  source: "Home",
                  target: "Inicio",
                  context: "navigation",
                  references: ["src/App.tsx:20"],
                  comment: "",
                },
              ],
            },
          })
        })
      )

      await init(testConfig, extractionResult)

      expect(apiCalls[0].url).toMatchInlineSnapshot(
        `https://translation.io/api/v1/segments/init.json?api_key=test-api-key-123`
      )
      expect(await apiCalls[0].json()).toMatchInlineSnapshot(
        { version: expectVersion },
        `
        {
          client: lingui,
          segments: {
            es: [
              {
                comment: js-lingui-explicit-id,
                context: app.welcome,
                references: [
                  src/App.tsx:10,
                ],
                source: Welcome to our app,
                target: ,
                type: source,
              },
              {
                comment: ,
                context: ,
                references: [
                  src/App.tsx:15,
                ],
                source: Hello {name},
                target: ,
                type: source,
              },
              {
                comment: ,
                context: navigation,
                references: [
                  src/App.tsx:20,
                ],
                source: Home,
                target: ,
                type: source,
              },
              {
                comment: page.about | js-lingui-explicit-id-and-context,
                context: about.title,
                references: [
                  src/About.tsx:5,
                ],
                source: About Us,
                target: ,
                type: source,
              },
            ],
            fr: [
              {
                comment: js-lingui-explicit-id,
                context: app.welcome,
                references: [
                  src/App.tsx:10,
                ],
                source: Welcome to our app,
                target: Bienvenue dans notre application,
                type: source,
              },
              {
                comment: ,
                context: ,
                references: [
                  src/App.tsx:15,
                ],
                source: Hello {name},
                target: Bonjour {name},
                type: source,
              },
              {
                comment: ,
                context: navigation,
                references: [
                  src/App.tsx:20,
                ],
                source: Home,
                target: Accueil,
                type: source,
              },
              {
                comment: page.about | js-lingui-explicit-id-and-context,
                context: about.title,
                references: [
                  src/About.tsx:5,
                ],
                source: About Us,
                target: À propos,
                type: source,
              },
            ],
          },
          source_language: en,
          target_languages: [
            fr,
            es,
          ],
          version: StringMatching /\\\\d\\+\\\\\\.\\\\d\\+\\.\\\\d\\+/,
        }
      `
      )

      // Verify updated files exist
      expect(listingToHumanReadable(readFsToListing(outputDir)))
        .toMatchInlineSnapshot(`
        #######################
        Filename: es.po
        #######################

        msgid ""
        msgstr ""
        "POT-Creation-Date: 2023-03-15 10:00+0000\\n"
        "MIME-Version: 1.0\\n"
        "Content-Type: text/plain; charset=utf-8\\n"
        "Content-Transfer-Encoding: 8bit\\n"
        "X-Generator: @lingui/cli\\n"
        "Language: es\\n"

        #. js-lingui-explicit-id
        #: src/About.tsx:5
        msgctxt "page.about"
        msgid "about.title"
        msgstr "Acerca de"

        #: src/App.tsx:15
        msgid "Hello {name}"
        msgstr "Hola {name}"

        #: src/App.tsx:20
        msgctxt "navigation"
        msgid "Home"
        msgstr "Inicio"

        #. js-lingui-explicit-id
        #: src/App.tsx:10
        msgid "app.welcome"
        msgstr "Bienvenido a nuestra aplicación"


        #######################
        Filename: fr.po
        #######################

        msgid ""
        msgstr ""
        "POT-Creation-Date: 2023-03-15 10:00+0000\\n"
        "MIME-Version: 1.0\\n"
        "Content-Type: text/plain; charset=utf-8\\n"
        "Content-Transfer-Encoding: 8bit\\n"
        "X-Generator: @lingui/cli\\n"
        "Language: fr\\n"

        #. js-lingui-explicit-id
        #: src/About.tsx:5
        msgctxt "page.about"
        msgid "about.title"
        msgstr "À propos (updated)"

        #: src/App.tsx:15
        msgid "Hello {name}"
        msgstr "Bonjour {name} (updated)"

        #: src/App.tsx:20
        msgctxt "navigation"
        msgid "Home"
        msgstr "Accueil (updated)"

        #. js-lingui-explicit-id
        #: src/App.tsx:10
        msgid "app.welcome"
        msgstr "Bienvenue dans notre application (updated)"


      `)
    })

    it("should handle init errors", async () => {
      const outputDir = await prepareTestDir()
      const { testConfig, catalogs } = await makeTestConfig(outputDir)

      mswServer.use(
        http.post("https://translation.io/api/v1/*", () => {
          return HttpResponse.json<TranslationIoResponse>(
            {
              errors: ["API key is invalid"],
            },
            {
              status: 400,
            }
          )
        })
      )

      const extractionResult = createExtractionResult(catalogs)
      await expect(init(testConfig, extractionResult)).resolves
        .toMatchInlineSnapshot(`
        {
          errors: [
            API key is invalid,
          ],
          success: false,
        }
      `)
    })

    it("should handle network errors during init", async () => {
      const outputDir = await prepareTestDir()
      const { testConfig, catalogs } = await makeTestConfig(outputDir)

      mswServer.use(
        http.post("https://translation.io/api/v1/*", () => {
          return HttpResponse.error()
        })
      )

      const extractionResult = createExtractionResult(catalogs)
      await expect(init(testConfig, extractionResult)).rejects.toThrow()
    })

    it("should handle multiple catalogs and distribute segments correctly", async () => {
      const outputDir = await prepareTestDir()
      const messagesDir = path.join(outputDir, "messages")
      const errorsDir = path.join(outputDir, "errors")

      const { testConfig, catalogs } = await makeTestConfig(outputDir, {
        catalogs: [
          {
            path: path.join(outputDir, "messages", "{locale}"),
            include: [],
          },
          {
            path: path.join(outputDir, "errors", "{locale}"),
            include: [],
          },
        ],
      })

      mswServer.use(
        http.post("https://translation.io/api/v1/*", () => {
          // Translation.io returns all segments in one namespace
          return HttpResponse.json<TranslationIoResponse>({
            project: {
              name: "Test Project",
              url: "https://translation.io/test",
            },
            segments: {
              fr: [
                // Messages from first catalog
                {
                  type: "source",
                  source: "Welcome to our app",
                  target: "Bienvenue dans notre application (updated)",
                  context: "app.welcome",
                  references: ["src/App.tsx:10"],
                  comment: "js-lingui-explicit-id",
                },
                {
                  type: "source",
                  source: "About Us",
                  target: "À propos (updated)",
                  context: "about.title",
                  references: ["src/About.tsx:5"],
                  comment: "page.about | js-lingui-explicit-id-and-context",
                },
                {
                  type: "source",
                  source: "Hello {name}",
                  target: "Bonjour {name} (updated)",
                  context: "",
                  references: ["src/App.tsx:15"],
                  comment: "",
                },
                {
                  type: "source",
                  source: "Home",
                  target: "Accueil (updated)",
                  context: "navigation",
                  references: ["src/App.tsx:20"],
                  comment: "",
                },
                // Messages from second catalog
                {
                  type: "source",
                  source: "Error occurred",
                  target: "Une erreur s'est produite (updated)",
                  context: "",
                  references: ["src/errors.tsx:1"],
                  comment: "",
                },
                {
                  type: "source",
                  source: "Not found",
                  target: "Non trouvé (updated)",
                  context: "",
                  references: ["src/errors.tsx:2"],
                  comment: "",
                },
              ],
              es: [
                // Messages from first catalog
                {
                  type: "source",
                  source: "Welcome to our app",
                  target: "Bienvenido a nuestra aplicación",
                  context: "app.welcome",
                  references: ["src/App.tsx:10"],
                  comment: "js-lingui-explicit-id",
                },
                {
                  type: "source",
                  source: "About Us",
                  target: "Acerca de",
                  context: "about.title",
                  references: ["src/About.tsx:5"],
                  comment: "page.about | js-lingui-explicit-id-and-context",
                },
                {
                  type: "source",
                  source: "Hello {name}",
                  target: "Hola {name}",
                  context: "",
                  references: ["src/App.tsx:15"],
                  comment: "",
                },
                {
                  type: "source",
                  source: "Home",
                  target: "Inicio",
                  context: "navigation",
                  references: ["src/App.tsx:20"],
                  comment: "",
                },
                // Messages from second catalog
                {
                  type: "source",
                  source: "Error occurred",
                  target: "Ocurrió un error (updated)",
                  context: "",
                  references: ["src/errors.tsx:1"],
                  comment: "",
                },
                {
                  type: "source",
                  source: "Not found",
                  target: "No encontrado (updated)",
                  context: "",
                  references: ["src/errors.tsx:2"],
                  comment: "",
                },
              ],
            },
          })
        })
      )

      const extractionResult = createMultiCatalogExtractionResult(catalogs)
      await init(testConfig, extractionResult)

      // Verify that segments from Translation.io are distributed to correct catalogs
      expect(listingToHumanReadable(readFsToListing(messagesDir)))
        .toMatchInlineSnapshot(`
        #######################
        Filename: es.po
        #######################

        msgid ""
        msgstr ""
        "POT-Creation-Date: 2023-03-15 10:00+0000\\n"
        "MIME-Version: 1.0\\n"
        "Content-Type: text/plain; charset=utf-8\\n"
        "Content-Transfer-Encoding: 8bit\\n"
        "X-Generator: @lingui/cli\\n"
        "Language: es\\n"

        #. js-lingui-explicit-id
        #: src/About.tsx:5
        msgctxt "page.about"
        msgid "about.title"
        msgstr "Acerca de"

        #: src/App.tsx:15
        msgid "Hello {name}"
        msgstr "Hola {name}"

        #: src/App.tsx:20
        msgctxt "navigation"
        msgid "Home"
        msgstr "Inicio"

        #. js-lingui-explicit-id
        #: src/App.tsx:10
        msgid "app.welcome"
        msgstr "Bienvenido a nuestra aplicación"


        #######################
        Filename: fr.po
        #######################

        msgid ""
        msgstr ""
        "POT-Creation-Date: 2023-03-15 10:00+0000\\n"
        "MIME-Version: 1.0\\n"
        "Content-Type: text/plain; charset=utf-8\\n"
        "Content-Transfer-Encoding: 8bit\\n"
        "X-Generator: @lingui/cli\\n"
        "Language: fr\\n"

        #. js-lingui-explicit-id
        #: src/About.tsx:5
        msgctxt "page.about"
        msgid "about.title"
        msgstr "À propos (updated)"

        #: src/App.tsx:15
        msgid "Hello {name}"
        msgstr "Bonjour {name} (updated)"

        #: src/App.tsx:20
        msgctxt "navigation"
        msgid "Home"
        msgstr "Accueil (updated)"

        #. js-lingui-explicit-id
        #: src/App.tsx:10
        msgid "app.welcome"
        msgstr "Bienvenue dans notre application (updated)"


      `)

      expect(listingToHumanReadable(readFsToListing(errorsDir)))
        .toMatchInlineSnapshot(`
        #######################
        Filename: es.po
        #######################

        msgid ""
        msgstr ""
        "POT-Creation-Date: 2023-03-15 10:00+0000\\n"
        "MIME-Version: 1.0\\n"
        "Content-Type: text/plain; charset=utf-8\\n"
        "Content-Transfer-Encoding: 8bit\\n"
        "X-Generator: @lingui/cli\\n"
        "Language: es\\n"

        #: src/errors.tsx:1
        msgid "Error occurred"
        msgstr "Ocurrió un error (updated)"

        #: src/errors.tsx:2
        msgid "Not found"
        msgstr "No encontrado (updated)"


        #######################
        Filename: fr.po
        #######################

        msgid ""
        msgstr ""
        "POT-Creation-Date: 2023-03-15 10:00+0000\\n"
        "MIME-Version: 1.0\\n"
        "Content-Type: text/plain; charset=utf-8\\n"
        "Content-Transfer-Encoding: 8bit\\n"
        "X-Generator: @lingui/cli\\n"
        "Language: fr\\n"

        #: src/errors.tsx:1
        msgid "Error occurred"
        msgstr "Une erreur s'est produite (updated)"

        #: src/errors.tsx:2
        msgid "Not found"
        msgstr "Non trouvé (updated)"


      `)
    })
  })

  describe("sync", () => {
    it("should send sync request with source segments", async () => {
      const outputDir = await prepareTestDir()
      const { testConfig, catalogs } = await makeTestConfig(outputDir)

      const extractionResult = createExtractionResult(catalogs)

      const apiCalls: StrictRequest<DefaultBodyType>[] = []

      mswServer.use(
        http.post("https://translation.io/api/v1/*", ({ request }) => {
          apiCalls.push(request)

          return HttpResponse.json<TranslationIoResponse>({
            project: {
              name: "Test Project",
              url: "https://translation.io/test",
            },
            segments: {
              fr: [
                {
                  type: "source",
                  source: "Welcome to our app",
                  target: "Bienvenue",
                  context: "app.welcome",
                  references: ["src/App.tsx:10"],
                  comment: "js-lingui-explicit-id",
                },
                {
                  type: "source",
                  source: "About Us",
                  target: "À propos",
                  context: "about.title",
                  references: ["src/About.tsx:5"],
                  comment: "page.about | js-lingui-explicit-id-and-context",
                },
                {
                  type: "source",
                  source: "Hello {name}",
                  target: "Bonjour {name}",
                  context: "",
                  references: ["src/App.tsx:15"],
                  comment: "",
                },
                {
                  type: "source",
                  source: "Home",
                  target: "Accueil",
                  context: "navigation",
                  references: ["src/App.tsx:20"],
                  comment: "",
                },
              ],
              es: [
                {
                  type: "source",
                  source: "Welcome to our app",
                  target: "Bienvenido",
                  context: "app.welcome",
                  references: ["src/App.tsx:10"],
                  comment: "js-lingui-explicit-id",
                },
                {
                  type: "source",
                  source: "About Us",
                  target: "Acerca de",
                  context: "about.title",
                  references: ["src/About.tsx:5"],
                  comment: "page.about | js-lingui-explicit-id-and-context",
                },
                {
                  type: "source",
                  source: "Hello {name}",
                  target: "Hola {name}",
                  context: "",
                  references: ["src/App.tsx:15"],
                  comment: "",
                },
                {
                  type: "source",
                  source: "Home",
                  target: "Inicio",
                  context: "navigation",
                  references: ["src/App.tsx:20"],
                  comment: "",
                },
              ],
            },
          })
        })
      )

      await sync(testConfig, options, extractionResult)

      // Verify request
      expect(apiCalls[0].url).toMatchInlineSnapshot(
        `https://translation.io/api/v1/segments/sync.json?api_key=test-api-key-123`
      )
      expect(await apiCalls[0].json()).toMatchInlineSnapshot(
        { version: expectVersion },
        `
        {
          client: lingui,
          purge: false,
          segments: [
            {
              comment: js-lingui-explicit-id,
              context: app.welcome,
              references: [
                src/App.tsx:10,
              ],
              source: Welcome to our app,
              type: source,
            },
            {
              comment: ,
              context: ,
              references: [
                src/App.tsx:15,
              ],
              source: Hello {name},
              type: source,
            },
            {
              comment: ,
              context: navigation,
              references: [
                src/App.tsx:20,
              ],
              source: Home,
              type: source,
            },
            {
              comment: page.about | js-lingui-explicit-id-and-context,
              context: about.title,
              references: [
                src/About.tsx:5,
              ],
              source: About Us,
              type: source,
            },
          ],
          source_language: en,
          target_languages: [
            fr,
            es,
          ],
          version: StringMatching /\\\\d\\+\\\\\\.\\\\d\\+\\.\\\\d\\+/,
        }
      `
      )

      // Verify updated files exist
      expect(listingToHumanReadable(readFsToListing(outputDir)))
        .toMatchInlineSnapshot(`
        #######################
        Filename: es.po
        #######################

        msgid ""
        msgstr ""
        "POT-Creation-Date: 2023-03-15 10:00+0000\\n"
        "MIME-Version: 1.0\\n"
        "Content-Type: text/plain; charset=utf-8\\n"
        "Content-Transfer-Encoding: 8bit\\n"
        "X-Generator: @lingui/cli\\n"
        "Language: es\\n"

        #. js-lingui-explicit-id
        #: src/About.tsx:5
        msgctxt "page.about"
        msgid "about.title"
        msgstr "Acerca de"

        #: src/App.tsx:15
        msgid "Hello {name}"
        msgstr "Hola {name}"

        #: src/App.tsx:20
        msgctxt "navigation"
        msgid "Home"
        msgstr "Inicio"

        #. js-lingui-explicit-id
        #: src/App.tsx:10
        msgid "app.welcome"
        msgstr "Bienvenido"


        #######################
        Filename: fr.po
        #######################

        msgid ""
        msgstr ""
        "POT-Creation-Date: 2023-03-15 10:00+0000\\n"
        "MIME-Version: 1.0\\n"
        "Content-Type: text/plain; charset=utf-8\\n"
        "Content-Transfer-Encoding: 8bit\\n"
        "X-Generator: @lingui/cli\\n"
        "Language: fr\\n"

        #. js-lingui-explicit-id
        #: src/About.tsx:5
        msgctxt "page.about"
        msgid "about.title"
        msgstr "À propos"

        #: src/App.tsx:15
        msgid "Hello {name}"
        msgstr "Bonjour {name}"

        #: src/App.tsx:20
        msgctxt "navigation"
        msgid "Home"
        msgstr "Accueil"

        #. js-lingui-explicit-id
        #: src/App.tsx:10
        msgid "app.welcome"
        msgstr "Bienvenue"


      `)
    })

    it("should include purge option when clean is enabled", async () => {
      const outputDir = await prepareTestDir()
      const { testConfig, catalogs } = await makeTestConfig(outputDir)

      const extractionResult = createExtractionResult(catalogs)

      const cleanOptions = { ...options, clean: true }
      let capturedRequest: any = null

      mswServer.use(
        http.post("https://translation.io/api/v1/*", async ({ request }) => {
          capturedRequest = await request.json()

          return HttpResponse.json<TranslationIoResponse>({
            project: {
              name: "Test Project",
              url: "https://translation.io/test",
            },
            segments: {
              fr: [],
              es: [],
            },
          })
        })
      )

      await sync(testConfig, cleanOptions, extractionResult)

      expect(capturedRequest).toHaveProperty("purge", true)
    })

    it("should handle sync errors", async () => {
      const outputDir = await prepareTestDir()
      const { testConfig, catalogs } = await makeTestConfig(outputDir)

      const extractionResult = createExtractionResult(catalogs)

      mswServer.use(
        http.post("https://translation.io/api/v1/*", () => {
          return HttpResponse.json<TranslationIoResponse>(
            {
              errors: ["Synchronization failed"],
            },
            { status: 400 }
          )
        })
      )

      const result = await sync(testConfig, options, extractionResult)

      expect(result).toMatchInlineSnapshot(`
        {
          errors: [
            Synchronization failed,
          ],
          success: false,
        }
      `)
    })

    it("should handle network errors during sync", async () => {
      const outputDir = await prepareTestDir()
      const { testConfig, catalogs } = await makeTestConfig(outputDir)

      const extractionResult = createExtractionResult(catalogs)

      mswServer.use(
        http.post("https://translation.io/api/v1/*", () => {
          return HttpResponse.error()
        })
      )

      await expect(
        sync(testConfig, options, extractionResult)
      ).rejects.toThrow()
    })

    it("should handle multiple catalogs and distribute segments correctly", async () => {
      const outputDir = await prepareTestDir()
      const messagesDir = path.join(outputDir, "messages")
      const errorsDir = path.join(outputDir, "errors")

      const { testConfig, catalogs } = await makeTestConfig(outputDir, {
        catalogs: [
          {
            path: path.join(outputDir, "messages", "{locale}"),
            include: [],
          },
          {
            path: path.join(outputDir, "errors", "{locale}"),
            include: [],
          },
        ],
      })

      const apiCalls: StrictRequest<DefaultBodyType>[] = []

      mswServer.use(
        http.post("https://translation.io/api/v1/*", ({ request }) => {
          apiCalls.push(request)

          // Translation.io returns all segments in one namespace
          return HttpResponse.json<TranslationIoResponse>({
            project: {
              name: "Test Project",
              url: "https://translation.io/test",
            },
            segments: {
              fr: [
                // Messages from first catalog
                {
                  type: "source",
                  source: "Welcome to our app",
                  target: "Bienvenue dans notre application (from sync)",
                  context: "app.welcome",
                  references: ["src/App.tsx:10"],
                  comment: "js-lingui-explicit-id",
                },
                {
                  type: "source",
                  source: "About Us",
                  target: "À propos (from sync)",
                  context: "about.title",
                  references: ["src/About.tsx:5"],
                  comment: "page.about | js-lingui-explicit-id-and-context",
                },
                {
                  type: "source",
                  source: "Hello {name}",
                  target: "Bonjour {name} (from sync)",
                  context: "",
                  references: ["src/App.tsx:15"],
                  comment: "",
                },
                {
                  type: "source",
                  source: "Home",
                  target: "Accueil (from sync)",
                  context: "navigation",
                  references: ["src/App.tsx:20"],
                  comment: "",
                },
                // Messages from second catalog
                {
                  type: "source",
                  source: "Error occurred",
                  target: "Une erreur s'est produite (from sync)",
                  context: "",
                  references: ["src/errors.tsx:1"],
                  comment: "",
                },
                {
                  type: "source",
                  source: "Not found",
                  target: "Non trouvé (from sync)",
                  context: "",
                  references: ["src/errors.tsx:2"],
                  comment: "",
                },
              ],
              es: [
                // Messages from first catalog
                {
                  type: "source",
                  source: "Welcome to our app",
                  target: "Bienvenido a nuestra aplicación (from sync)",
                  context: "app.welcome",
                  references: ["src/App.tsx:10"],
                  comment: "js-lingui-explicit-id",
                },
                {
                  type: "source",
                  source: "About Us",
                  target: "Acerca de (from sync)",
                  context: "about.title",
                  references: ["src/About.tsx:5"],
                  comment: "page.about | js-lingui-explicit-id-and-context",
                },
                {
                  type: "source",
                  source: "Hello {name}",
                  target: "Hola {name} (from sync)",
                  context: "",
                  references: ["src/App.tsx:15"],
                  comment: "",
                },
                {
                  type: "source",
                  source: "Home",
                  target: "Inicio (from sync)",
                  context: "navigation",
                  references: ["src/App.tsx:20"],
                  comment: "",
                },
                // Messages from second catalog
                {
                  type: "source",
                  source: "Error occurred",
                  target: "Ocurrió un error (from sync)",
                  context: "",
                  references: ["src/errors.tsx:1"],
                  comment: "",
                },
                {
                  type: "source",
                  source: "Not found",
                  target: "No encontrado (from sync)",
                  context: "",
                  references: ["src/errors.tsx:2"],
                  comment: "",
                },
              ],
            },
          })
        })
      )

      const extractionResult = createMultiCatalogExtractionResult(catalogs)
      await sync(testConfig, options, extractionResult)

      // Verify that segments are sent as a flat list
      expect(await apiCalls[0].json()).toMatchObject({
        segments: expect.arrayContaining([
          expect.objectContaining({
            source: "Welcome to our app",
            context: "app.welcome",
          }),
          expect.objectContaining({
            source: "Error occurred",
          }),
          expect.objectContaining({
            source: "Not found",
          }),
        ]),
      })

      // Verify that segments from Translation.io are distributed to correct catalogs
      expect(listingToHumanReadable(readFsToListing(messagesDir)))
        .toMatchInlineSnapshot(`
        #######################
        Filename: es.po
        #######################

        msgid ""
        msgstr ""
        "POT-Creation-Date: 2023-03-15 10:00+0000\\n"
        "MIME-Version: 1.0\\n"
        "Content-Type: text/plain; charset=utf-8\\n"
        "Content-Transfer-Encoding: 8bit\\n"
        "X-Generator: @lingui/cli\\n"
        "Language: es\\n"

        #. js-lingui-explicit-id
        #: src/About.tsx:5
        msgctxt "page.about"
        msgid "about.title"
        msgstr "Acerca de (from sync)"

        #: src/App.tsx:15
        msgid "Hello {name}"
        msgstr "Hola {name} (from sync)"

        #: src/App.tsx:20
        msgctxt "navigation"
        msgid "Home"
        msgstr "Inicio (from sync)"

        #. js-lingui-explicit-id
        #: src/App.tsx:10
        msgid "app.welcome"
        msgstr "Bienvenido a nuestra aplicación (from sync)"


        #######################
        Filename: fr.po
        #######################

        msgid ""
        msgstr ""
        "POT-Creation-Date: 2023-03-15 10:00+0000\\n"
        "MIME-Version: 1.0\\n"
        "Content-Type: text/plain; charset=utf-8\\n"
        "Content-Transfer-Encoding: 8bit\\n"
        "X-Generator: @lingui/cli\\n"
        "Language: fr\\n"

        #. js-lingui-explicit-id
        #: src/About.tsx:5
        msgctxt "page.about"
        msgid "about.title"
        msgstr "À propos (from sync)"

        #: src/App.tsx:15
        msgid "Hello {name}"
        msgstr "Bonjour {name} (from sync)"

        #: src/App.tsx:20
        msgctxt "navigation"
        msgid "Home"
        msgstr "Accueil (from sync)"

        #. js-lingui-explicit-id
        #: src/App.tsx:10
        msgid "app.welcome"
        msgstr "Bienvenue dans notre application (from sync)"


      `)

      expect(listingToHumanReadable(readFsToListing(errorsDir)))
        .toMatchInlineSnapshot(`
        #######################
        Filename: es.po
        #######################

        msgid ""
        msgstr ""
        "POT-Creation-Date: 2023-03-15 10:00+0000\\n"
        "MIME-Version: 1.0\\n"
        "Content-Type: text/plain; charset=utf-8\\n"
        "Content-Transfer-Encoding: 8bit\\n"
        "X-Generator: @lingui/cli\\n"
        "Language: es\\n"

        #: src/errors.tsx:1
        msgid "Error occurred"
        msgstr "Ocurrió un error (from sync)"

        #: src/errors.tsx:2
        msgid "Not found"
        msgstr "No encontrado (from sync)"


        #######################
        Filename: fr.po
        #######################

        msgid ""
        msgstr ""
        "POT-Creation-Date: 2023-03-15 10:00+0000\\n"
        "MIME-Version: 1.0\\n"
        "Content-Type: text/plain; charset=utf-8\\n"
        "Content-Transfer-Encoding: 8bit\\n"
        "X-Generator: @lingui/cli\\n"
        "Language: fr\\n"

        #: src/errors.tsx:1
        msgid "Error occurred"
        msgstr "Une erreur s'est produite (from sync)"

        #: src/errors.tsx:2
        msgid "Not found"
        msgstr "Non trouvé (from sync)"


      `)
    })
  })

  describe("syncProcess", () => {
    it("should call init first, then sync if already initialized", async () => {
      const outputDir = await prepareTestDir()
      const { testConfig, catalogs } = await makeTestConfig(outputDir)

      const extractionResult = createExtractionResult(catalogs)

      const calls: string[] = []

      mswServer.use(
        http.post(
          "https://translation.io/api/v1/segments/init.json",
          ({ request }) => {
            calls.push("init")
            // First init call - return error indicating already initialized
            return HttpResponse.json<TranslationIoResponse>(
              {
                errors: ["This project has already been initialized."],
              },
              { status: 400 }
            )
          }
        ),
        http.post(
          "https://translation.io/api/v1/segments/sync.json",
          ({ request }) => {
            calls.push("sync")
            // Second sync call - return success
            return HttpResponse.json<TranslationIoResponse>({
              project: {
                name: "Test Project",
                url: "https://translation.io/test",
              },
              segments: {
                fr: [],
                es: [],
              },
            })
          }
        )
      )

      const result = await syncProcess(testConfig, options, extractionResult)

      expect(calls).toEqual(["init", "sync"])
      expect(result).toMatchInlineSnapshot(`

                                                                        ----------
                                                                        Project successfully synchronized. Please use this URL to translate: https://translation.io/test
                                                                        ----------
                                                      `)
    })

    it("should call only init if not initialized", async () => {
      const outputDir = await prepareTestDir()
      const { testConfig, catalogs } = await makeTestConfig(outputDir)

      const extractionResult = createExtractionResult(catalogs)

      const calls: any[] = []

      mswServer.use(
        http.post("https://translation.io/api/v1/*", ({ request }) => {
          calls.push(request)

          return HttpResponse.json<TranslationIoResponse>({
            project: {
              name: "Test Project",
              url: "https://translation.io/test",
            },
            segments: {
              fr: [],
              es: [],
            },
          })
        })
      )

      const result = await syncProcess(testConfig, options, extractionResult)

      expect(calls).toHaveLength(1)
      expect(result).toMatchInlineSnapshot(`

                                                                ----------
                                                                Project successfully synchronized. Please use this URL to translate: https://translation.io/test
                                                                ----------
                                                `)
    })

    it("should handle errors with proper error format", async () => {
      const outputDir = await prepareTestDir()
      const { testConfig, catalogs } = await makeTestConfig(outputDir)

      const extractionResult = createExtractionResult(catalogs)

      mswServer.use(
        http.post("https://translation.io/api/v1/*", () => {
          return HttpResponse.json<TranslationIoResponse>(
            {
              errors: ["Network error", "Connection timeout"],
            },
            { status: 400 }
          )
        })
      )

      await expect(syncProcess(testConfig, options, extractionResult)).rejects
        .toMatchInlineSnapshot(`

                                                                ----------
                                                                Synchronization with Translation.io failed: Network error, Connection timeout
                                                                ----------
                                                `)
    })

    it("should handle network errors during syncProcess", async () => {
      const outputDir = await prepareTestDir()
      const { testConfig, catalogs } = await makeTestConfig(outputDir)

      const extractionResult = createExtractionResult(catalogs)

      mswServer.use(
        http.post("https://translation.io/api/v1/*", () => {
          return HttpResponse.error()
        })
      )

      await expect(
        syncProcess(testConfig, options, extractionResult)
      ).rejects.toThrow()
    })
  })
})

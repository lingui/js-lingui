import syncProcess, {
  init,
  writeSegmentsToCatalogs,
  sync,
} from "./translationIO"
import { LinguiConfig, makeConfig } from "@lingui/conf"
import fs from "fs"
import path from "path"
import { CliExtractOptions } from "../lingui-extract"
import MockDate from "mockdate"
import { listingToHumanReadable, readFsToListing } from "../tests"
import {
  TranslationIoResponse,
  TranslationIoSegment,
} from "./translationIO/translationio-api"
import { setupServer } from "msw/node"
import { DefaultBodyType, http, HttpResponse, StrictRequest } from "msw"
import { getFormat } from "@lingui/cli/api"
import { FormatterWrapper } from "../api/formats"
import { Catalog } from "../api/catalog"

export const mswServer = setupServer()

mswServer.listen({
  onUnhandledRequest: "error",
})

const testDir = path.join(__dirname, "test-output")
const fixturesDir = path.join(__dirname, "fixtures")

const expectVersion = expect.stringMatching(/\d+\.\d+.\d+/)

// Helper to prepare test directory
async function prepareTestDir(subdir: string) {
  const dir = path.join(testDir, subdir)
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true })
  }
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

describe("TranslationIO Integration", () => {
  let config: LinguiConfig
  let options: CliExtractOptions
  let format: FormatterWrapper

  beforeAll(() => {
    MockDate.set(new Date("2023-03-15T10:00Z"))
  })

  afterAll(() => {
    MockDate.reset()
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true })
    }
  })

  beforeEach(async () => {
    const outputDir = await prepareTestDir("current")

    config = {
      rootDir: outputDir,
      locales: ["en", "fr", "es"],
      sourceLocale: "en",
      format: "po",
      catalogs: [
        {
          path: path.join(outputDir, "{locale}"),
          include: [],
        },
      ],
      service: {
        name: "TranslationIO",
        apiKey: "test-api-key-123",
      },
    }

    format = await getFormat(
      config.format,
      config.formatOptions,
      config.sourceLocale
    )

    options = {
      verbose: false,
      clean: false,
      overwrite: false,
      locale: [],
      prevFormat: null,
      workersOptions: { poolSize: 0 },
    }
  })

  describe("writeSegmentsToCatalogs", () => {
    it("should save segments to PO files", async () => {
      const outputDir = await prepareTestDir("save-segments")
      const testConfig = makeConfig({
        ...config,
        rootDir: outputDir,
        catalogs: [
          {
            path: path.join(outputDir, "{locale}"),
            include: [],
          },
        ],
      })

      const catalogs = [
        new Catalog(
          {
            name: "messages",
            path: path.join(outputDir, "{locale}"),
            format,
            include: [],
          },
          testConfig
        ),
      ]

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

      await writeSegmentsToCatalogs(testConfig, catalogs, segmentsPerLocale)

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
      const outputDir = await prepareTestDir("save-segments-replace")
      const testConfig = makeConfig({
        ...config,
        rootDir: outputDir,
        catalogs: [
          {
            path: path.join(outputDir, "{locale}"),
            include: [],
          },
        ],
      })

      const catalogs = [
        new Catalog(
          {
            name: "messages",
            path: path.join(outputDir, "{locale}"),
            format,
            include: [],
          },
          testConfig
        ),
      ]

      // Create existing files
      fs.writeFileSync(path.join(outputDir, "fr.po"), "old content")
      fs.writeFileSync(
        path.join(outputDir, "fr.po").replace(".po", ".js"),
        "old js content"
      )

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

      await writeSegmentsToCatalogs(testConfig, catalogs, segmentsPerLocale)

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
      const outputDir = await prepareTestDir("init-test")

      // Copy source files
      const sourceDir = path.join(fixturesDir, "source")
      const enPath = path.join(outputDir, "en.po")
      fs.copyFileSync(path.join(sourceDir, "en.po"), enPath)

      // Copy existing translations
      const existingDir = path.join(fixturesDir, "existing")
      const frPath = path.join(outputDir, "fr.po")
      const esPath = path.join(outputDir, "es.po")
      fs.copyFileSync(path.join(existingDir, "fr.po"), frPath)
      fs.copyFileSync(path.join(existingDir, "es.po"), esPath)

      const testConfig = makeConfig({
        ...config,
        rootDir: outputDir,
        catalogs: [
          {
            path: path.join(outputDir, "{locale}"),
            include: [],
          },
        ],
      })

      const catalogs = [
        new Catalog(
          {
            name: "messages",
            path: path.join(outputDir, "{locale}"),
            format,
            include: [],
          },
          testConfig
        ),
      ]

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

      await init(testConfig, catalogs)

      expect(apiCalls[0].url).toMatchInlineSnapshot(
        `https://translation.io/api/v1/segments/init.json?api_key=test-api-key-123`
      )
      expect(await apiCalls[0].json()).toMatchInlineSnapshot(`
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
          version: 5.7.0,
        }
      `)

      // Verify updated files exist
      expect(listingToHumanReadable(readFsToListing(outputDir)))
        .toMatchInlineSnapshot(`
        #######################
        Filename: en.po
        #######################

        msgid ""
        msgstr ""
        "POT-Creation-Date: 2023-03-15 10:00+0000\\n"
        "MIME-Version: 1.0\\n"
        "Content-Type: text/plain; charset=utf-8\\n"
        "Content-Transfer-Encoding: 8bit\\n"
        "X-Generator: @lingui/cli\\n"
        "Language: en\\n"

        #. js-lingui-explicit-id
        #: src/App.tsx:10
        msgid "app.welcome"
        msgstr "Welcome to our app"

        #: src/App.tsx:15
        msgid "Hello {name}"
        msgstr ""

        #: src/App.tsx:20
        msgctxt "navigation"
        msgid "Home"
        msgstr ""

        #. js-lingui-explicit-id
        #: src/About.tsx:5
        msgctxt "page.about"
        msgid "about.title"
        msgstr "About Us"


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
        "Project-Id-Version: \\n"
        "Report-Msgid-Bugs-To: \\n"
        "PO-Revision-Date: \\n"
        "Last-Translator: \\n"
        "Language-Team: \\n"
        "Plural-Forms: \\n"

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
        "Project-Id-Version: \\n"
        "Report-Msgid-Bugs-To: \\n"
        "PO-Revision-Date: \\n"
        "Last-Translator: \\n"
        "Language-Team: \\n"
        "Plural-Forms: \\n"

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
      const outputDir = await prepareTestDir("init-error")
      const sourceDir = path.join(fixturesDir, "source")
      const enPath = path.join(outputDir, "en.po")
      fs.copyFileSync(path.join(sourceDir, "en.po"), enPath)

      // Copy existing translations so init can read them
      const existingDir = path.join(fixturesDir, "existing")
      const frPath = path.join(outputDir, "fr.po")
      const esPath = path.join(outputDir, "es.po")
      fs.copyFileSync(path.join(existingDir, "fr.po"), frPath)
      fs.copyFileSync(path.join(existingDir, "es.po"), esPath)

      const testConfig = makeConfig({
        ...config,
        rootDir: outputDir,
        catalogs: [
          {
            path: path.join(outputDir, "{locale}"),
            include: [],
          },
        ],
      })

      const catalogs = [
        new Catalog(
          {
            name: "messages",
            path: path.join(outputDir, "{locale}"),
            format,
            include: [],
          },
          testConfig
        ),
      ]

      mswServer.use(
        http.post("https://translation.io/api/v1/*", () => {
          // todo: check what real status server return on error
          return HttpResponse.json<TranslationIoResponse>({
            errors: ["API key is invalid"],
          })
        })
      )

      await expect(init(testConfig, catalogs)).resolves.toMatchInlineSnapshot(`
        {
          errors: [
            API key is invalid,
          ],
          success: false,
        }
      `)
    })

    it("should handle network errors during init", async () => {
      const outputDir = await prepareTestDir("init-network-error")
      const sourceDir = path.join(fixturesDir, "source")
      const enPath = path.join(outputDir, "en.po")
      fs.copyFileSync(path.join(sourceDir, "en.po"), enPath)

      // Copy existing translations so init can read them
      const existingDir = path.join(fixturesDir, "existing")
      const frPath = path.join(outputDir, "fr.po")
      const esPath = path.join(outputDir, "es.po")
      fs.copyFileSync(path.join(existingDir, "fr.po"), frPath)
      fs.copyFileSync(path.join(existingDir, "es.po"), esPath)

      const testConfig = makeConfig({
        ...config,
        rootDir: outputDir,
        catalogs: [
          {
            path: path.join(outputDir, "{locale}"),
            include: [],
          },
        ],
      })

      const catalogs = [
        new Catalog(
          {
            name: "messages",
            path: path.join(outputDir, "{locale}"),
            format,
            include: [],
          },
          testConfig
        ),
      ]

      mswServer.use(
        http.post("https://translation.io/api/v1/*", () => {
          return HttpResponse.error()
        })
      )

      await expect(init(testConfig, catalogs)).rejects.toThrow()
    })
  })

  describe("sync", () => {
    it("should send sync request with source segments", async () => {
      const outputDir = await prepareTestDir("sync-test")
      const sourceDir = path.join(fixturesDir, "source")
      const enPath = path.join(outputDir, "en.po")
      fs.copyFileSync(path.join(sourceDir, "en.po"), enPath)

      const testConfig = makeConfig({
        ...config,
        rootDir: outputDir,
        catalogs: [
          {
            path: path.join(outputDir, "{locale}"),
            include: [],
          },
        ],
      })

      const catalogs = [
        new Catalog(
          {
            name: "messages",
            path: path.join(outputDir, "{locale}"),
            format,
            include: [],
          },
          testConfig
        ),
      ]
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

      await sync(testConfig, options, catalogs)

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
        Filename: en.po
        #######################

        msgid ""
        msgstr ""
        "POT-Creation-Date: 2023-03-15 10:00+0000\\n"
        "MIME-Version: 1.0\\n"
        "Content-Type: text/plain; charset=utf-8\\n"
        "Content-Transfer-Encoding: 8bit\\n"
        "X-Generator: @lingui/cli\\n"
        "Language: en\\n"

        #. js-lingui-explicit-id
        #: src/App.tsx:10
        msgid "app.welcome"
        msgstr "Welcome to our app"

        #: src/App.tsx:15
        msgid "Hello {name}"
        msgstr ""

        #: src/App.tsx:20
        msgctxt "navigation"
        msgid "Home"
        msgstr ""

        #. js-lingui-explicit-id
        #: src/About.tsx:5
        msgctxt "page.about"
        msgid "about.title"
        msgstr "About Us"


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
      const outputDir = await prepareTestDir("sync-purge")
      const sourceDir = path.join(fixturesDir, "source")
      const enPath = path.join(outputDir, "en.po")
      fs.copyFileSync(path.join(sourceDir, "en.po"), enPath)

      const testConfig = makeConfig({
        ...config,
        rootDir: outputDir,
        catalogs: [
          {
            path: path.join(outputDir, "{locale}"),
            include: [],
          },
        ],
      })
      const catalogs = [
        new Catalog(
          {
            name: "messages",
            path: path.join(outputDir, "{locale}"),
            format,
            include: [],
          },
          testConfig
        ),
      ]
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

      await sync(testConfig, cleanOptions, catalogs)

      expect(capturedRequest).toHaveProperty("purge", true)
    })

    it("should handle sync errors", async () => {
      const outputDir = await prepareTestDir("sync-error")
      const sourceDir = path.join(fixturesDir, "source")
      const enPath = path.join(outputDir, "en.po")
      fs.copyFileSync(path.join(sourceDir, "en.po"), enPath)

      const testConfig = makeConfig({
        ...config,
        rootDir: outputDir,
        catalogs: [
          {
            path: path.join(outputDir, "{locale}"),
            include: [],
          },
        ],
      })
      const catalogs = [
        new Catalog(
          {
            name: "messages",
            path: path.join(outputDir, "{locale}"),
            format,
            include: [],
          },
          testConfig
        ),
      ]
      mswServer.use(
        http.post("https://translation.io/api/v1/*", () => {
          return HttpResponse.json<TranslationIoResponse>({
            errors: ["Synchronization failed"],
          })
        })
      )

      const result = await sync(testConfig, options, catalogs)

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
      const outputDir = await prepareTestDir("sync-network-error")
      const sourceDir = path.join(fixturesDir, "source")
      const enPath = path.join(outputDir, "en.po")
      fs.copyFileSync(path.join(sourceDir, "en.po"), enPath)

      const testConfig = makeConfig({
        ...config,
        rootDir: outputDir,
        catalogs: [
          {
            path: path.join(outputDir, "{locale}"),
            include: [],
          },
        ],
      })
      const catalogs = [
        new Catalog(
          {
            name: "messages",
            path: path.join(outputDir, "{locale}"),
            format,
            include: [],
          },
          testConfig
        ),
      ]
      mswServer.use(
        http.post("https://translation.io/api/v1/*", () => {
          return HttpResponse.error()
        })
      )

      await expect(sync(testConfig, options, catalogs)).rejects.toThrow()
    })
  })

  describe("syncProcess", () => {
    it("should call init first, then sync if already initialized", async () => {
      const outputDir = await prepareTestDir("sync-process")
      const sourceDir = path.join(fixturesDir, "source")
      const enPath = path.join(outputDir, "en.po")
      fs.copyFileSync(path.join(sourceDir, "en.po"), enPath)

      // Copy existing translations so init can read them
      const existingDir = path.join(fixturesDir, "existing")
      const frPath = path.join(outputDir, "fr.po")
      const esPath = path.join(outputDir, "es.po")
      fs.copyFileSync(path.join(existingDir, "fr.po"), frPath)
      fs.copyFileSync(path.join(existingDir, "es.po"), esPath)

      const testConfig = makeConfig({
        ...config,
        rootDir: outputDir,
        catalogs: [
          {
            path: path.join(outputDir, "{locale}"),
            include: [],
          },
        ],
      })

      const calls: string[] = []

      mswServer.use(
        http.post("https://translation.io/api/v1/*", ({ request }) => {
          const url = new URL(request.url)
          if (url.pathname.includes("init.json")) {
            calls.push("init")
            // First init call - return error indicating already initialized
            return HttpResponse.json<TranslationIoResponse>({
              errors: ["This project has already been initialized."],
            })
          } else if (url.pathname.includes("sync.json")) {
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
          return HttpResponse.json({ errors: ["Unknown endpoint"] })
        })
      )

      const result = await syncProcess(testConfig, options)

      expect(calls).toEqual(["init", "sync"])
      expect(result).toMatchInlineSnapshot(`

                                ----------
                                Project successfully synchronized. Please use this URL to translate: https://translation.io/test
                                ----------
                        `)
    })

    it("should call only init if not initialized", async () => {
      const outputDir = await prepareTestDir("sync-process")
      const sourceDir = path.join(fixturesDir, "source")
      const enPath = path.join(outputDir, "en.po")
      fs.copyFileSync(path.join(sourceDir, "en.po"), enPath)

      // Copy existing translations so init can read them
      const existingDir = path.join(fixturesDir, "existing")
      const frPath = path.join(outputDir, "fr.po")
      const esPath = path.join(outputDir, "es.po")
      fs.copyFileSync(path.join(existingDir, "fr.po"), frPath)
      fs.copyFileSync(path.join(existingDir, "es.po"), esPath)

      const testConfig = makeConfig({
        ...config,
        rootDir: outputDir,
        catalogs: [
          {
            path: path.join(outputDir, "{locale}"),
            include: [],
          },
        ],
      })

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

      const result = await syncProcess(testConfig, options)

      expect(calls).toHaveLength(1)
      expect(result).toMatchInlineSnapshot(`

                        ----------
                        Project successfully synchronized. Please use this URL to translate: https://translation.io/test
                        ----------
                  `)
    })

    it("should handle errors with proper error format", async () => {
      const outputDir = await prepareTestDir("sync-process-error")
      const sourceDir = path.join(fixturesDir, "source")
      const enPath = path.join(outputDir, "en.po")
      fs.copyFileSync(path.join(sourceDir, "en.po"), enPath)

      // Copy existing translations so init can read them
      const existingDir = path.join(fixturesDir, "existing")
      const frPath = path.join(outputDir, "fr.po")
      const esPath = path.join(outputDir, "es.po")
      fs.copyFileSync(path.join(existingDir, "fr.po"), frPath)
      fs.copyFileSync(path.join(existingDir, "es.po"), esPath)

      const testConfig = makeConfig({
        ...config,
        rootDir: outputDir,
        catalogs: [
          {
            path: path.join(outputDir, "{locale}"),
            include: [],
          },
        ],
      })

      mswServer.use(
        http.post("https://translation.io/api/v1/*", () => {
          // return Htt
          return HttpResponse.json<TranslationIoResponse>({
            errors: ["Network error", "Connection timeout"],
          })
        })
      )

      await expect(syncProcess(testConfig, options)).rejects
        .toMatchInlineSnapshot(`

                        ----------
                        Synchronization with Translation.io failed: Network error, Connection timeout
                        ----------
                  `)
    })

    it("should handle network errors during syncProcess", async () => {
      const outputDir = await prepareTestDir("sync-process-network-error")
      const sourceDir = path.join(fixturesDir, "source")
      const enPath = path.join(outputDir, "en.po")
      fs.copyFileSync(path.join(sourceDir, "en.po"), enPath)

      // Copy existing translations so init can read them
      const existingDir = path.join(fixturesDir, "existing")
      const frPath = path.join(outputDir, "fr.po")
      const esPath = path.join(outputDir, "es.po")
      fs.copyFileSync(path.join(existingDir, "fr.po"), frPath)
      fs.copyFileSync(path.join(existingDir, "es.po"), esPath)

      const testConfig = makeConfig({
        ...config,
        rootDir: outputDir,
        catalogs: [
          {
            path: path.join(outputDir, "{locale}"),
            include: [],
          },
        ],
      })

      mswServer.use(
        http.post("https://translation.io/api/v1/*", () => {
          return HttpResponse.error()
        })
      )

      await expect(syncProcess(testConfig, options)).rejects.toThrow()
    })
  })
})

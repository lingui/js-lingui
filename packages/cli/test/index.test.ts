import extractTemplateCommand from "../src/lingui-extract-template"
import extractCommand from "../src/lingui-extract"
import extractExperimentalCommand from "../src/lingui-extract-experimental"
import { command as compileCommand } from "../src/lingui-compile"
import fs from "fs/promises"
import { sync } from "glob"
import nodepath from "path"
import { getConfig, makeConfig } from "@lingui/conf"
import { compareFolders } from "../src/tests"
import { getConsoleMockCalls, mockConsole } from "@lingui/jest-mocks"
import MockDate from "mockdate"

jest.mock("ora", () => {
  return () => {
    return {
      start(...args: any) {
        console.log(args)
      },
      succeed(...args: any) {
        console.log(args)
      },
      fail(...args: any) {
        console.log(args)
      },
    }
  }
})

function replaceDuration(snapshot: string) {
  return snapshot.replace(/Done in .+ms/g, "Done in <n>ms")
}
async function prepare(caseFolderName: string) {
  const rootDir = nodepath.join(__dirname, caseFolderName)

  const actualPath = nodepath.join(rootDir, "actual")
  const expectedPath = nodepath.join(rootDir, "expected")
  const existingPath = nodepath.join(rootDir, "existing")

  await fs.rm(actualPath, {
    recursive: true,
    force: true,
  })

  if (sync(existingPath).length === 1) {
    await fs.cp(existingPath, actualPath, { recursive: true })
  }

  return { rootDir, actualPath, existingPath, expectedPath }
}

describe("E2E Extractor Test", () => {
  beforeAll(() => {
    MockDate.set(new Date("2023-03-15T10:00Z"))
  })

  afterAll(() => {
    MockDate.reset()
  })

  it("Should collect messages from files and write catalog in PO format", async () => {
    const { rootDir, actualPath, expectedPath } = await prepare(
      "extract-po-format"
    )

    await mockConsole(async (console) => {
      const result = await extractCommand(
        makeConfig({
          rootDir: rootDir,
          locales: ["en", "pl"],
          sourceLocale: "en",
          format: "po",
          catalogs: [
            {
              path: "<rootDir>/actual/{locale}",
              include: ["<rootDir>/fixtures"],
            },
          ],
        }),
        { workersOptions: { poolSize: 0 } }
      )

      expect(result).toBeTruthy()
      expect(getConsoleMockCalls(console.error)).toBeFalsy()
      expect(replaceDuration(getConsoleMockCalls(console.log)))
        .toMatchInlineSnapshot(`

                Done in <n>ms
                Catalog statistics for actual/{locale}: 
                ┌─────────────┬─────────────┬─────────┐
                │ Language    │ Total count │ Missing │
                ├─────────────┼─────────────┼─────────┤
                │ en (source) │     10      │    -    │
                │ pl          │     10      │   10    │
                └─────────────┴─────────────┴─────────┘

                (Use "yarn extract" to update catalogs with new messages.)
                (Use "yarn compile" to compile catalogs for production. Alternatively, use bundler plugins: https://lingui.dev/ref/cli#compiling-catalogs-in-ci)
            `)
    })

    compareFolders(actualPath, expectedPath)
  })

  it("extractTemplate should extract into .pot template", async () => {
    const { rootDir, actualPath, expectedPath } = await prepare(
      "extract-template-po-format"
    )

    await fs.rm(actualPath, {
      recursive: true,
      force: true,
    })

    await mockConsole(async (console) => {
      const result = await extractTemplateCommand(getConfig({ cwd: rootDir }), {
        workersOptions: { poolSize: 0 },
      })

      expect(result).toBeTruthy()
      expect(getConsoleMockCalls(console.error)).toBeFalsy()
      expect(getConsoleMockCalls(console.log)).toMatchInlineSnapshot(`
        Catalog statistics for actual/messages.pot: 7 messages

      `)
    })

    compareFolders(actualPath, expectedPath)
  })

  it("extractTemplate should extract into .pot template with worker pool", async () => {
    const { rootDir, actualPath, expectedPath } = await prepare(
      "extract-template-po-format"
    )

    await fs.rm(actualPath, {
      recursive: true,
      force: true,
    })

    await mockConsole(async (console) => {
      const result = await extractTemplateCommand(getConfig({ cwd: rootDir }), {
        workersOptions: { poolSize: 2 },
        verbose: true,
      })

      expect(result).toBeTruthy()
      expect(getConsoleMockCalls(console.error)).toBeFalsy()
      expect(getConsoleMockCalls(console.log)).toMatchInlineSnapshot(`
        Extracting messages from source files…
        Use worker pool of size 2
        Catalog statistics for actual/messages.pot: 7 messages

      `)
    })

    compareFolders(actualPath, expectedPath)
  })

  it("Should extract with multiThread enabled", async () => {
    const { rootDir, actualPath, expectedPath } = await prepare(
      "extract-po-format"
    )

    await mockConsole(async (console) => {
      const result = await extractCommand(getConfig({ cwd: rootDir }), {
        verbose: true,
        workersOptions: { poolSize: 2 },
      })

      expect(result).toBeTruthy()
      expect(getConsoleMockCalls(console.error)).toBeFalsy()
      expect(replaceDuration(getConsoleMockCalls(console.log)))
        .toMatchInlineSnapshot(`
        Extracting messages from source files…
        Use worker pool of size 2

        Done in <n>ms
        Catalog statistics for actual/{locale}: 
        ┌─────────────┬─────────────┬─────────┐
        │ Language    │ Total count │ Missing │
        ├─────────────┼─────────────┼─────────┤
        │ en (source) │     10      │    -    │
        │ pl          │     10      │   10    │
        └─────────────┴─────────────┴─────────┘

        (Use "yarn extract" to update catalogs with new messages.)
        (Use "yarn compile" to compile catalogs for production. Alternatively, use bundler plugins: https://lingui.dev/ref/cli#compiling-catalogs-in-ci)
      `)
    })

    compareFolders(actualPath, expectedPath)
  })

  describe("extractor-experimental", () => {
    it("should extract to template when --template passed", async () => {
      const { rootDir, actualPath, expectedPath } = await prepare(
        "extractor-experimental-template"
      )

      const config = getConfig({ cwd: rootDir })

      await mockConsole(async (console) => {
        const result = await extractExperimentalCommand(config, {
          template: true,
          workersOptions: {
            poolSize: 0,
          },
        })

        await compileCommand(config, {
          allowEmpty: true,
          workersOptions: {
            poolSize: 0,
          },
        })

        expect(getConsoleMockCalls(console.error)).toBeFalsy()
        expect(result).toBeTruthy()
        expect(replaceDuration(getConsoleMockCalls(console.log)))
          .toMatchInlineSnapshot(`
          You have using an experimental feature
          Experimental features are not covered by semver, and may cause unexpected or broken application behavior. Use at your own risk.

          Catalog statistics for fixtures/pages/about.page.tsx:
          5 message(s) extracted

          Catalog statistics for fixtures/pages/index.page.ts:
          1 message(s) extracted

          Compiling message catalogs…
          Done in <n>ms
        `)
      })

      compareFolders(actualPath, expectedPath)
    })

    it("should extract to catalogs and merge with existing", async () => {
      const { rootDir, actualPath, expectedPath } = await prepare(
        "extractor-experimental"
      )

      await mockConsole(async (console) => {
        const config = getConfig({ cwd: rootDir })

        const result = await extractExperimentalCommand(config, {
          workersOptions: {
            poolSize: 0,
          },
        })

        await compileCommand(config, {
          allowEmpty: true,
          workersOptions: {
            poolSize: 0,
          },
        })

        expect(getConsoleMockCalls(console.error)).toBeFalsy()
        expect(result).toBeTruthy()
        expect(replaceDuration(getConsoleMockCalls(console.log)))
          .toMatchInlineSnapshot(`
          You have using an experimental feature
          Experimental features are not covered by semver, and may cause unexpected or broken application behavior. Use at your own risk.

          Catalog statistics for fixtures/pages/about.page.ts:
          ┌─────────────┬─────────────┬─────────┐
          │ Language    │ Total count │ Missing │
          ├─────────────┼─────────────┼─────────┤
          │ en (source) │      3      │    -    │
          │ pl          │      4      │    3    │
          └─────────────┴─────────────┴─────────┘

          Catalog statistics for fixtures/pages/index.page.ts:
          ┌─────────────┬─────────────┬─────────┐
          │ Language    │ Total count │ Missing │
          ├─────────────┼─────────────┼─────────┤
          │ en (source) │      2      │    -    │
          │ pl          │      2      │    2    │
          └─────────────┴─────────────┴─────────┘

          Compiling message catalogs…
          Done in <n>ms
        `)
      })

      compareFolders(actualPath, expectedPath)
    })

    it("should extract to catalogs with worker pool", async () => {
      const { rootDir, actualPath, expectedPath } = await prepare(
        "extractor-experimental"
      )

      await mockConsole(async (console) => {
        const config = getConfig({ cwd: rootDir })

        const result = await extractExperimentalCommand(config, {
          verbose: true,
          workersOptions: {
            poolSize: 2,
          },
        })

        await compileCommand(config, {
          allowEmpty: true,
          workersOptions: {
            poolSize: 0,
          },
        })

        expect(getConsoleMockCalls(console.error)).toBeFalsy()
        expect(result).toBeTruthy()
        expect(replaceDuration(getConsoleMockCalls(console.log)))
          .toMatchInlineSnapshot(`
          Extracting messages from source files…
          You have using an experimental feature
          Experimental features are not covered by semver, and may cause unexpected or broken application behavior. Use at your own risk.

          Use worker pool of size 2
          Catalog statistics for fixtures/pages/about.page.ts:
          ┌─────────────┬─────────────┬─────────┐
          │ Language    │ Total count │ Missing │
          ├─────────────┼─────────────┼─────────┤
          │ en (source) │      3      │    -    │
          │ pl          │      4      │    3    │
          └─────────────┴─────────────┴─────────┘

          Catalog statistics for fixtures/pages/index.page.ts:
          ┌─────────────┬─────────────┬─────────┐
          │ Language    │ Total count │ Missing │
          ├─────────────┼─────────────┼─────────┤
          │ en (source) │      2      │    -    │
          │ pl          │      2      │    2    │
          └─────────────┴─────────────┴─────────┘

          Compiling message catalogs…
          Done in <n>ms
        `)
      })

      compareFolders(actualPath, expectedPath)
    })

    it("should extract and clean obsolete", async () => {
      const { rootDir, actualPath, expectedPath } = await prepare(
        "extractor-experimental-clean"
      )

      await mockConsole(async (console) => {
        const result = await extractExperimentalCommand(
          makeConfig({
            rootDir: rootDir,
            locales: ["en", "pl"],
            sourceLocale: "en",
            format: "po",
            catalogs: [],
            experimental: {
              extractor: {
                entries: ["<rootDir>/fixtures/pages/**/*.page.{ts,tsx}"],
                output: "<rootDir>/actual/{entryName}.{locale}",
              },
            },
          }),
          {
            workersOptions: {
              poolSize: 0,
            },
            clean: true,
          }
        )

        expect(getConsoleMockCalls(console.error)).toBeFalsy()
        expect(result).toBeTruthy()
        expect(replaceDuration(getConsoleMockCalls(console.log)))
          .toMatchInlineSnapshot(`
          You have using an experimental feature
          Experimental features are not covered by semver, and may cause unexpected or broken application behavior. Use at your own risk.

          Catalog statistics for fixtures/pages/about.page.ts:
          ┌─────────────┬─────────────┬─────────┐
          │ Language    │ Total count │ Missing │
          ├─────────────┼─────────────┼─────────┤
          │ en (source) │      2      │    -    │
          │ pl          │      3      │    2    │
          └─────────────┴─────────────┴─────────┘

          Catalog statistics for fixtures/pages/index.page.ts:
          ┌─────────────┬─────────────┬─────────┐
          │ Language    │ Total count │ Missing │
          ├─────────────┼─────────────┼─────────┤
          │ en (source) │      1      │    -    │
          │ pl          │      1      │    1    │
          └─────────────┴─────────────┴─────────┘

        `)
      })

      compareFolders(actualPath, expectedPath)
    })
  })

  it("should extract consistently with files argument", async () => {
    const { rootDir, actualPath, expectedPath } = await prepare(
      "extract-partial-consistency"
    )

    await mockConsole(async () => {
      await extractCommand(
        makeConfig({
          rootDir: rootDir,
          locales: ["en"],
          sourceLocale: "en",
          format: "po",
          catalogs: [
            {
              path: "<rootDir>/actual/{locale}",
              include: ["<rootDir>/fixtures"],
            },
          ],
        }),
        {
          files: [nodepath.join(rootDir, "fixtures", "file-b.tsx")],
          workersOptions: { poolSize: 0 },
        }
      )
    })

    compareFolders(actualPath, expectedPath)
  })

  it("Should not report statistics on pseudolocalizations", async () => {
    const { rootDir } = await prepare("extract-po-format")

    await mockConsole(async (console) => {
      const result = await extractCommand(
        makeConfig({
          rootDir: rootDir,
          locales: ["en", "pl", "pseudo-LOCALE"],
          pseudoLocale: "pseudo-LOCALE",
          sourceLocale: "en",
          format: "po",
          catalogs: [
            {
              path: "<rootDir>/actual/{locale}",
              include: ["<rootDir>/fixtures"],
            },
          ],
        }),
        { workersOptions: { poolSize: 0 } }
      )

      expect(result).toBeTruthy()
      expect(getConsoleMockCalls(console.error)).toBeFalsy()
      expect(replaceDuration(getConsoleMockCalls(console.log)))
        .toMatchInlineSnapshot(`

                        Done in <n>ms
                        Catalog statistics for actual/{locale}: 
                        ┌─────────────┬─────────────┬─────────┐
                        │ Language    │ Total count │ Missing │
                        ├─────────────┼─────────────┼─────────┤
                        │ en (source) │     10      │    -    │
                        │ pl          │     10      │   10    │
                        └─────────────┴─────────────┴─────────┘

                        (Use "yarn extract" to update catalogs with new messages.)
                        (Use "yarn compile" to compile catalogs for production. Alternatively, use bundler plugins: https://lingui.dev/ref/cli#compiling-catalogs-in-ci)
                  `)
    })
  })
})

import extractTemplateCommand from "../src/lingui-extract-template"
import extractCommand from "../src/lingui-extract"
import extractExperimentalCommand from "../src/lingui-extract-experimental"
import { command as compileCommand } from "../src/lingui-compile"
import fs from "fs/promises"
import os from "os"
import nodepath from "path"
import { makeConfig } from "@lingui/conf"
import { listingToHumanReadable, readFsToJson } from "../src/tests"
import mockDate from "mockdate"
import { getConsoleMockCalls, mockConsole } from "@lingui/jest-mocks"

export function compareFolders(pathA: string, pathB: string) {
  const listingA = listingToHumanReadable(readFsToJson(pathA))
  const listingB = listingToHumanReadable(readFsToJson(pathB))

  expect(listingA).toBe(listingB)
}

async function prepare(caseFolderName: string) {
  const rootDir = nodepath.join(__dirname, caseFolderName)

  const actualPath = nodepath.join(rootDir, "actual")
  const expectedPath = nodepath.join(rootDir, "expected")

  await fs.rm(actualPath, {
    recursive: true,
    force: true,
  })

  return { rootDir, actualPath, expectedPath }
}

describe("E2E Extractor Test", () => {
  beforeEach(async () => {
    mockDate.set(new Date(2023, 2, 15, 10, 0, 0).toUTCString())
  })

  afterEach(() => {
    mockDate.reset()
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
        {}
      )

      expect(result).toBeTruthy()
      expect(getConsoleMockCalls(console.error)).toBeFalsy()
      expect(getConsoleMockCalls(console.log)).toMatchInlineSnapshot(`
        Catalog statistics for actual/{locale}: 
        ┌─────────────┬─────────────┬─────────┐
        │ Language    │ Total count │ Missing │
        ├─────────────┼─────────────┼─────────┤
        │ en (source) │      7      │    -    │
        │ pl          │      7      │    7    │
        └─────────────┴─────────────┴─────────┘

        (use "yarn extract" to update catalogs with new messages)
        (use "yarn compile" to compile catalogs for production)
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
      const result = await extractTemplateCommand(
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
        {}
      )

      expect(result).toBeTruthy()
      expect(getConsoleMockCalls(console.error)).toBeFalsy()
      expect(getConsoleMockCalls(console.log)).toMatchInlineSnapshot(`
        Catalog statistics for actual/messages.pot: 7 messages

      `)
    })

    compareFolders(actualPath, expectedPath)
  })

  const skipOnWindows = os.platform().startsWith("win")
    ? describe.skip
    : describe

  skipOnWindows("extractor-experimental", () => {
    it("should extract to template when --template passed", async () => {
      const { rootDir, actualPath, expectedPath } = await prepare(
        "extractor-experimental-template"
      )

      await mockConsole(async (console) => {
        const config = makeConfig({
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
        })

        const result = await extractExperimentalCommand(config, {
          template: true,
        })

        await compileCommand(config, {
          allowEmpty: true,
        })

        expect(getConsoleMockCalls(console.error)).toBeFalsy()
        expect(result).toBeTruthy()
        expect(getConsoleMockCalls(console.log)).toMatchInlineSnapshot(`
          You have using an experimental feature
          Experimental features are not covered by semver, and may cause unexpected or broken application behavior. Use at your own risk.

          Catalog statistics for fixtures/pages/about.page.tsx:
          4 message(s) extracted

          Catalog statistics for fixtures/pages/index.page.ts:
          1 message(s) extracted

          Compiling message catalogs…
        `)
      })

      compareFolders(actualPath, expectedPath)
    })

    it("should extract to catalogs and merge with existing", async () => {
      const { rootDir, actualPath, expectedPath } = await prepare(
        "extractor-experimental"
      )

      await fs.cp(
        nodepath.join(rootDir, "existing"),
        nodepath.join(rootDir, "actual"),
        { recursive: true }
      )

      await mockConsole(async (console) => {
        const config = makeConfig({
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
        })

        const result = await extractExperimentalCommand(config, {})

        await compileCommand(config, {
          allowEmpty: true,
        })

        expect(getConsoleMockCalls(console.error)).toBeFalsy()
        expect(result).toBeTruthy()
        expect(getConsoleMockCalls(console.log)).toMatchInlineSnapshot(`
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

          Compiling message catalogs…
        `)
      })

      compareFolders(actualPath, expectedPath)
    })
    it("should extract and clean obsolete", async () => {
      const { rootDir, actualPath, expectedPath } = await prepare(
        "extractor-experimental-clean"
      )

      await fs.cp(
        nodepath.join(rootDir, "existing"),
        nodepath.join(rootDir, "actual"),
        { recursive: true }
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
            clean: true,
          }
        )

        expect(getConsoleMockCalls(console.error)).toBeFalsy()
        expect(result).toBeTruthy()
        expect(getConsoleMockCalls(console.log)).toMatchInlineSnapshot(`
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
})

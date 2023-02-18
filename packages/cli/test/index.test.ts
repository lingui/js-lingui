import extractTemplateCommand from "../src/lingui-extract-template"
import extractCommand from "../src/lingui-extract"
import fs from "fs/promises"
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
})

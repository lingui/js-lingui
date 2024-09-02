import path from "path"
import { transformFile } from "../src/metroTransformer"

describe("Lingui Metro transformer tests", () => {
  const priorEnv = process.env.LINGUI_CONFIG
  const priorCwd = process.cwd()
  const testDir = path.join(__dirname, "__fixtures__", "test-project")
  const catalogDir = path.join(testDir, "locales")

  beforeAll(() => {
    process.chdir(testDir)
  })
  afterAll(() => {
    process.env.LINGUI_CONFIG = priorEnv
    process.chdir(priorCwd)
  })

  it.each([
    [
      "English PO file",
      "en",
      `/*eslint-disable*/export const messages=JSON.parse("{\\"p1AaTM\\":\\"Add a message to your inbox\\",\\"dEgA5A\\":\\"Cancel\\"}");`,
    ],
    [
      "Czech PO file with fallback to English",
      "cs",
      `/*eslint-disable*/export const messages=JSON.parse("{\\"p1AaTM\\":\\"Přidat zprávu do doručené pošty\\",\\"dEgA5A\\":\\"Cancel\\"}");`,
    ],
  ])(
    "should transform %s to a JS export",
    async (_lang, langCode, expectedSnapshot) => {
      const filename = path.relative(
        testDir,
        path.join(catalogDir, langCode, "messages.po")
      )
      const result = await transformFile({
        filename,
      })

      expect(result).toMatchInlineSnapshot(expectedSnapshot)
    }
  )

  it("should throw error when provided path is not relative to project root", async () => {
    // CLI's getCatalogForFile uses path.relative which returns results with respect to cwd.
    // Even is path is relative to project root, it will not be considered as matched if cwd is different.
    const filename = path.join(catalogDir, "en", "messages.po")
    await expect(
      transformFile({
        filename,
      })
    ).rejects.toThrow(/is not matched to any of your catalogs paths/)
  })
})

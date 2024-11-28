import path from "path"
import { transformFile } from "../src/metroTransformer"

describe("Lingui Metro transformer tests", () => {
  const priorEnv = process.env.LINGUI_CONFIG
  const priorCwd = process.cwd()
  const testProjectDir = path.join(__dirname, "__fixtures__", "test-project")
  const catalogsDir = path.join(testProjectDir, "locales")

  beforeAll(() => {
    process.chdir(testProjectDir)
  })
  afterAll(() => {
    process.env.LINGUI_CONFIG = priorEnv
    process.chdir(priorCwd)
  })

  it.each([
    [
      "English PO file",
      "en",
      `/*eslint-disable*/export const messages=JSON.parse("{\\"p1AaTM\\":[\\"Add a message to your inbox\\"],\\"dEgA5A\\":[\\"Cancel\\"]}");`,
    ],
    [
      "Czech PO file with fallback to English",
      "cs",
      `/*eslint-disable*/export const messages=JSON.parse("{\\"p1AaTM\\":[\\"Přidat zprávu do doručené pošty\\"],\\"dEgA5A\\":[\\"Cancel\\"]}");`,
    ],
  ])(
    "should transform %s to a JS export",
    async (_label, langCode, expectedSnapshot) => {
      const filename = path.relative(
        testProjectDir,
        path.join(catalogsDir, langCode, "messages.po")
      )
      const result = await transformFile({
        filename,
      })

      expect(result).toMatchInlineSnapshot(expectedSnapshot)
    }
  )

  it("given a valid absolute path (not relative to lingui config root), transformer will turn it into path relative to lingui config and succeed", async () => {
    // this is not how the `transformFile` function would be called in a real project and covers an implementation detail
    const filename = path.join(catalogsDir, "en", "messages.po")
    await expect(
      transformFile({
        filename,
      })
    ).resolves.toMatchInlineSnapshot(
      `/*eslint-disable*/export const messages=JSON.parse("{\\"p1AaTM\\":[\\"Add a message to your inbox\\"],\\"dEgA5A\\":[\\"Cancel\\"]}");`
    )
  })

  it("should throw an error when provided path is invalid", async () => {
    const filename = path.join(
      catalogsDir,
      "some",
      "bad",
      "path",
      "messages.po"
    )
    await expect(
      transformFile({
        filename,
      })
    ).rejects.toThrow(/is not matched to any of your catalogs paths/)
  })
})

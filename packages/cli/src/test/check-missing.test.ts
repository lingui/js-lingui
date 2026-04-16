import { renderCheckResult, runCheck } from "../lingui-check.js"
import { makeConfig } from "@lingui/conf"
import { createFixtures, readFsToListing } from "../tests.js"
import {
  extractCatalogs,
  getTestConfig,
  replaceInFile,
  workersOptions,
} from "./checkTestUtils.js"

describe("Check: missing", () => {
  it("Should fail when a locale catalog has missing translations", async () => {
    const rootDir = await createFixtures({
      "src/app.ts": `
import { t } from "@lingui/core/macro"

t\`Hello World\`
        `,
      "locales/en/messages.po": `
msgid "Hello World"
msgstr "Hello World"
        `,
      "locales/pl/messages.po": `
msgid "Hello World"
msgstr ""
        `,
    })

    const config = getTestConfig(rootDir)
    const before = readFsToListing(rootDir)
    const result = await runCheck(config, "missing", {
      workersOptions,
    })
    const after = readFsToListing(rootDir)
    const rendered = renderCheckResult(result, false).join("\n")

    expect(result.passed).toBeFalsy()
    expect(after).toEqual(before)
    expect(rendered).toContain("FAIL missing")
  })

  it("Should render missing translation details in verbose mode", async () => {
    const rootDir = await createFixtures({
      "src/app.ts": `
import { t } from "@lingui/core/macro"

t\`Hello World\`
        `,
      "locales/en/messages.po": `
msgid "Hello World"
msgstr "Hello World"
        `,
      "locales/pl/messages.po": `
msgid "Hello World"
msgstr ""
        `,
    })

    const config = getTestConfig(rootDir)
    const result = await runCheck(config, "missing", {
      workersOptions,
    })
    const rendered = renderCheckResult(result, true).join("\n")

    expect(result.passed).toBeFalsy()
    expect(rendered).toContain("locales/pl/messages.po")
    expect(rendered).toContain("Hello World")
  })

  it("Should fail even when fallbackLocales can resolve missing translations", async () => {
    const rootDir = await createFixtures({
      "locales/en-US/messages.po": `
msgid "Hello World"
msgstr "Hello World"
        `,
      "locales/en-GB/messages.po": `
msgid "Hello World"
msgstr ""
        `,
    })

    const config = makeConfig({
      locales: ["en-US", "en-GB"],
      sourceLocale: "en-US",
      fallbackLocales: {
        default: "en-US",
      },
      rootDir,
      catalogs: [
        {
          path: "<rootDir>/locales/{locale}/messages",
          include: ["<rootDir>/src"],
          exclude: [],
        },
      ],
    })

    const result = await runCheck(config, "missing", {
      workersOptions,
    })
    const rendered = renderCheckResult(result, false).join("\n")

    expect(result.passed).toBeFalsy()
    expect(rendered).toContain("FAIL missing")
  })

  it("Should skip pseudo locale", async () => {
    const rootDir = await createFixtures({
      "locales/en/messages.po": `
msgid "Hello World"
msgstr "Hello World"
        `,
      "locales/pl/messages.po": `
msgid "Hello World"
msgstr ""
        `,
    })

    const config = getTestConfig(rootDir, {
      pseudoLocale: "pl",
    })

    const result = await runCheck(config, "missing", {
      workersOptions,
    })

    expect(result.passed).toBeTruthy()
  })

  it("Should respect locale filter", async () => {
    const rootDir = await createFixtures({
      "src/app.ts": `
import { t } from "@lingui/core/macro"

t\`Hello World\`
        `,
    })

    const config = getTestConfig(rootDir)
    await extractCatalogs(config)
    await replaceInFile(
      `${rootDir}/locales/pl/messages.po`,
      'msgid "Hello World"\nmsgstr ""',
      'msgid "Hello World"\nmsgstr "Czesc swiecie"',
    )

    const result = await runCheck(config, "missing", {
      locale: ["pl"],
      workersOptions,
    })

    expect(result.passed).toBeTruthy()
  })
})

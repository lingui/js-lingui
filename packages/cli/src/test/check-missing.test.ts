import fs from "fs"
import { renderCheckResult, runCheck } from "../lingui-check.js"
import { getConfig, LinguiConfig, makeConfig } from "@lingui/conf"
import { createFixtures, readFsToListing } from "../tests.js"
import {
  extractCatalogs,
  getTestConfig,
  replaceInFile,
  workersOptions,
} from "./checkTestUtils.js"

describe("Check: missing", () => {
  function getConfigText() {
    const config: LinguiConfig = {
      locales: ["en", "pl"],
      sourceLocale: "en",
      catalogs: [
        {
          path: "<rootDir>/locales/{locale}/messages",
          include: ["<rootDir>/src"],
          exclude: [],
        },
      ],
    }

    return `export default ${JSON.stringify(config)}`
  }

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

  it("Should pass by default when fallbackLocales can resolve missing translations", async () => {
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

    expect(result.passed).toBeTruthy()
    expect(rendered).toContain("PASS missing")
    expect(rendered).toContain("after applying fallbackLocales")
  })

  it("Should use a worker pool when config is loaded from a file", async () => {
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
      "lingui.config.ts": getConfigText(),
    })

    const config = getConfig({ cwd: rootDir })
    expect(config.resolvedConfigPath).toContain("lingui.config.ts")

    const result = await runCheck(config, "missing", {
      workersOptions: { poolSize: 2 },
    })

    expect(result.passed).toBeFalsy()
    expect(result.findings).toContainEqual(
      expect.objectContaining({
        code: "missing_translation",
        locale: "pl",
        catalogPath: "locales/pl/messages.po",
        message: expect.stringContaining("Hello World"),
      }),
    )
  }, 15000)

  it("Should use the single-process fallback without a config file", async () => {
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

    const config = getTestConfig(rootDir)
    expect(config.resolvedConfigPath).toBeUndefined()

    const result = await runCheck(config, "missing", {
      workersOptions: { poolSize: 2 },
    })

    expect(result.passed).toBeFalsy()
    expect(result.findings).toHaveLength(1)
  })

  it("Should fail in catalog mode when fallbackLocales resolve missing translations", async () => {
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
      missingBehavior: "catalog",
      workersOptions,
    })
    const rendered = renderCheckResult(result, false).join("\n")

    expect(result.passed).toBeFalsy()
    expect(rendered).toContain("FAIL missing")
    expect(rendered).toContain("before applying fallbackLocales")
  })

  it("Should skip multiple pseudo locales", async () => {
    const rootDir = await createFixtures({
      "locales/en/messages.po": `
msgid "Hello World"
msgstr "Hello World"
        `,
      "locales/pl/messages.po": `
msgid "Hello World"
msgstr ""
        `,
      "locales/ru/messages.po": `
msgid "Hello World"
msgstr ""
        `,
    })

    const config = getTestConfig(rootDir, {
      locales: ["en", "pl", "ru"],
      pseudoLocale: [{ locale: "pl" }, { locale: "ru" }],
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

  it("Should ignore obsolete messages left by extract without clean", async () => {
    const rootDir = await createFixtures({
      "src/app.ts": `
import { t } from "@lingui/core/macro"

t\`Hello World\`
t\`Obsolete Message\`
        `,
    })

    const config = getTestConfig(rootDir)
    await extractCatalogs(config)
    await replaceInFile(
      `${rootDir}/locales/pl/messages.po`,
      'msgid "Hello World"\nmsgstr ""',
      'msgid "Hello World"\nmsgstr "Czesc swiecie"',
    )
    await fs.promises.writeFile(
      `${rootDir}/src/app.ts`,
      `
import { t } from "@lingui/core/macro"

t\`Hello World\`
        `,
      "utf-8",
    )
    await extractCatalogs(config)

    const catalog = await fs.promises.readFile(
      `${rootDir}/locales/pl/messages.po`,
      "utf-8",
    )
    const result = await runCheck(config, "missing", {
      workersOptions,
    })
    const catalogResult = await runCheck(config, "missing", {
      missingBehavior: "catalog",
      workersOptions,
    })

    expect(catalog).toContain('#~ msgid "Obsolete Message"')
    expect(result.passed).toBeTruthy()
    expect(catalogResult.passed).toBeTruthy()
  })
})

import fs from "fs"
import { formatter as poFormatter } from "@lingui/format-po"
import { renderCheckResult, runCheck } from "../lingui-check.js"
import { createFixtures, readFsToListing } from "../tests.js"
import {
  extractCatalogs,
  getTestConfig,
  replaceInFile,
  workersOptions,
} from "./checkTestUtils.js"

describe("Check: sync", () => {
  it("Should pass when catalogs are in sync with extract output", async () => {
    const rootDir = await createFixtures({
      "src/app.ts": `
import { t } from "@lingui/core/macro"

t\`Hello World\`
        `,
    })

    const config = getTestConfig(rootDir)
    await extractCatalogs(config)
    const before = readFsToListing(rootDir)
    const result = await runCheck(config, "sync", {
      workersOptions,
    })
    const after = readFsToListing(rootDir)

    expect(result.passed).toBeTruthy()
    expect(after).toEqual(before)
  })

  it("Should use the single-process fallback without a config file", async () => {
    const rootDir = await createFixtures({
      "src/app.ts": `
import { t } from "@lingui/core/macro"

t\`Hello World\`
        `,
    })

    const config = getTestConfig(rootDir)
    expect(config.resolvedConfigPath).toBeUndefined()

    const result = await runCheck(config, "sync", {
      workersOptions: { poolSize: 2 },
    })

    expect(result.passed).toBeFalsy()
    expect(result.findings).toHaveLength(2)
  })

  it("Should fail when extract would add new messages", async () => {
    const rootDir = await createFixtures({
      "src/app.ts": `
import { t } from "@lingui/core/macro"

t\`Hello World\`
        `,
    })

    const config = getTestConfig(rootDir)
    await extractCatalogs(config)
    await fs.promises.writeFile(
      `${rootDir}/src/app.ts`,
      `
import { t } from "@lingui/core/macro"

t\`Hello World\`
t\`New Message\`
        `,
      "utf-8",
    )
    const before = readFsToListing(rootDir)
    const result = await runCheck(config, "sync", {
      workersOptions,
    })
    const after = readFsToListing(rootDir)
    const rendered = renderCheckResult(result, true).join("\n")

    expect(result.passed).toBeFalsy()
    expect(after).toEqual(before)
    expect(rendered).toContain("FAIL sync")
    expect(rendered).toContain("locales/en/messages.po")
    expect(rendered).toContain("out-of-sync")
  })

  it("Should report an existing empty catalog as out of sync", async () => {
    const rootDir = await createFixtures({
      "src/app.ts": `
import { t } from "@lingui/core/macro"

t\`Hello World\`
        `,
    })

    const config = getTestConfig(rootDir)
    await extractCatalogs(config)
    await fs.promises.writeFile(
      `${rootDir}/locales/en/messages.po`,
      "",
      "utf-8",
    )

    const result = await runCheck(config, "sync", {
      workersOptions,
    })
    const rendered = renderCheckResult(result, true).join("\n")

    expect(result.passed).toBeFalsy()
    expect(rendered).toContain("Catalog is out of sync with extract output")
    expect(rendered).not.toContain("Catalog is missing")
  })

  it("Should report extraction failures without embedding the catalog path", async () => {
    const rootDir = await createFixtures({
      "src/app.ts": "const syntax-error",
    })

    const result = await runCheck(getTestConfig(rootDir), "sync", {
      workersOptions,
    })

    expect(result.passed).toBeFalsy()
    expect(result.findings[0]).toMatchObject({
      code: "extract_failed",
      message: "Failed to extract messages",
    })
    expect(result.summary).toBe("Found 1 extraction failure(s).")

    const rendered = renderCheckResult(result, true)
    expect(rendered[1]).toBe(
      `${result.findings[0]!.catalogPath}: Failed to extract messages`,
    )
  })

  it("Should summarize extraction failures and out-of-sync catalogs separately", async () => {
    const rootDir = await createFixtures({
      "invalid/app.ts": "const syntax-error",
      "src/app.ts": `
import { t } from "@lingui/core/macro"

t\`Hello World\`
        `,
    })

    const config = getTestConfig(rootDir, {
      catalogs: [
        {
          path: "<rootDir>/locales/{locale}/broken",
          include: ["<rootDir>/invalid"],
          exclude: [],
        },
        {
          path: "<rootDir>/locales/{locale}/messages",
          include: ["<rootDir>/src"],
          exclude: [],
        },
      ],
    })

    const result = await runCheck(config, "sync", {
      locale: ["en"],
      workersOptions,
    })

    expect(result.findings.map((finding) => finding.code)).toEqual([
      "extract_failed",
      "catalog_out_of_sync",
    ])
    expect(result.summary).toBe(
      "Found 1 out-of-sync catalog file(s) and 1 extraction failure(s).",
    )
  })

  it("Should fail on source locale drift when overwrite = true", async () => {
    const rootDir = await createFixtures({
      "src/app.ts": `
import { t } from "@lingui/core/macro"

t({ id: "msg.hello", message: "Initial source message" })
        `,
    })

    const config = getTestConfig(rootDir)
    await extractCatalogs(config)
    await replaceInFile(
      `${rootDir}/locales/en/messages.po`,
      'msgstr "Initial source message"',
      'msgstr "Custom source translation"',
    )
    await fs.promises.writeFile(
      `${rootDir}/src/app.ts`,
      `
import { t } from "@lingui/core/macro"

t({ id: "msg.hello", message: "Updated source message" })
        `,
      "utf-8",
    )

    const result = await runCheck(config, "sync", {
      overwrite: true,
      workersOptions,
    })
    const rendered = renderCheckResult(result, false).join("\n")

    expect(result.passed).toBeFalsy()
    expect(rendered).toContain("FAIL sync")
  })

  it("Should not require source locale updates when overwrite = false", async () => {
    const rootDir = await createFixtures({
      "src/app.ts": `
import { t } from "@lingui/core/macro"

t({ id: "msg.hello", message: "Initial source message" })
        `,
    })

    const config = getTestConfig(rootDir)
    await extractCatalogs(config)
    await replaceInFile(
      `${rootDir}/locales/en/messages.po`,
      'msgstr "Initial source message"',
      'msgstr "Custom source translation"',
    )
    await fs.promises.writeFile(
      `${rootDir}/src/app.ts`,
      `
import { t } from "@lingui/core/macro"

t({ id: "msg.hello", message: "Updated source message" })
        `,
      "utf-8",
    )

    const result = await runCheck(config, "sync", {
      overwrite: false,
      workersOptions,
    })

    expect(result.passed).toBeTruthy()
  })

  it("Should respect clean semantics", async () => {
    const rootDir = await createFixtures({
      "src/app.ts": `
import { t } from "@lingui/core/macro"

t\`Hello World\`
t\`Obsolete Message\`
        `,
    })

    const config = getTestConfig(rootDir)
    await extractCatalogs(config)
    await fs.promises.writeFile(
      `${rootDir}/src/app.ts`,
      `
import { t } from "@lingui/core/macro"

t\`Hello World\`
        `,
      "utf-8",
    )
    await extractCatalogs(config)

    const syncResult = await runCheck(config, "sync", {
      workersOptions,
    })

    expect(syncResult.passed).toBeTruthy()

    const cleanResult = await runCheck(config, "sync", {
      clean: true,
      workersOptions,
    })
    const rendered = renderCheckResult(cleanResult, false).join("\n")

    expect(cleanResult.passed).toBeFalsy()
    expect(rendered).toContain("FAIL sync")
  })

  it("Should respect locale filter", async () => {
    const rootDir = await createFixtures({
      "src/app.ts": `
import { t } from "@lingui/core/macro"

t\`Hello World\`
t\`New Message\`
        `,
    })

    const config = getTestConfig(rootDir)
    await extractCatalogs(config)
    await replaceInFile(
      `${rootDir}/locales/pl/messages.po`,
      '\nmsgid "New Message"\nmsgstr ""\n',
      "\n",
    )

    const result = await runCheck(config, "sync", {
      locale: ["en"],
      workersOptions,
    })

    expect(result.passed).toBeTruthy()
  })

  it("Should ignore unreadable catalogs outside the selected locale filter", async () => {
    const rootDir = await createFixtures({
      "src/app.ts": `
import { t } from "@lingui/core/macro"

t\`Hello World\`
        `,
    })

    const config = getTestConfig(rootDir)
    await extractCatalogs(config)
    await fs.promises.writeFile(
      `${rootDir}/locales/pl/messages.po`,
      'msgid "broken"\nmsgstr "\n',
      "utf-8",
    )

    const result = await runCheck(config, "sync", {
      locale: ["en"],
      workersOptions,
    })

    expect(result.passed).toBeTruthy()
  })

  it("Should fail when formatter lineNumbers config changes", async () => {
    const rootDir = await createFixtures({
      "src/app.ts": `
import { t } from "@lingui/core/macro"

t\`Hello World\`
        `,
    })

    const config = getTestConfig(rootDir)
    await extractCatalogs(config)

    const configWithDifferentFormat = getTestConfig(rootDir, {
      format: poFormatter({ lineNumbers: false }),
    })

    const result = await runCheck(configWithDifferentFormat, "sync", {
      workersOptions,
    })
    const rendered = renderCheckResult(result, false).join("\n")

    expect(result.passed).toBeFalsy()
    expect(rendered).toContain("FAIL sync")
  })

  it("Should fail when formatter custom headers config changes", async () => {
    const rootDir = await createFixtures({
      "src/app.ts": `
import { t } from "@lingui/core/macro"

t\`Hello World\`
        `,
    })

    const config = getTestConfig(rootDir)
    await extractCatalogs(config)

    const configWithDifferentFormat = getTestConfig(rootDir, {
      format: poFormatter({
        customHeaderAttributes: {
          "X-Custom-Attribute": "custom-value",
        },
      }),
    })

    const result = await runCheck(configWithDifferentFormat, "sync", {
      workersOptions,
    })
    const rendered = renderCheckResult(result, false).join("\n")

    expect(result.passed).toBeFalsy()
    expect(rendered).toContain("FAIL sync")
  })

  it("Should pass when existing PO headers use a legacy format", async () => {
    const rootDir = await createFixtures({
      "src/app.ts": `
import { t } from "@lingui/core/macro"

t\`Hello World\`
        `,
    })

    const config = getTestConfig(rootDir)
    await extractCatalogs(config)

    const filename = `${rootDir}/locales/en/messages.po`
    const existing = await fs.promises.readFile(filename, "utf-8")
    const headerEnd = existing.indexOf("\n\n")
    const legacyHeader = `msgid ""
msgstr ""
"Language: legacy\\n"
"X-Generator: legacy-tool\\n"
"MIME-Version: 0.9\\n"
"Content-Type: application/x-legacy\\n"
"POT-Creation-Date: 2000-01-01 00:00+0000\\n"
"X-Custom-Header: legacy-value\\n"
`

    await fs.promises.writeFile(
      filename,
      legacyHeader + existing.slice(headerEnd + 1),
      "utf-8",
    )

    const result = await runCheck(config, "sync", {
      workersOptions,
    })

    expect(result.passed).toBeTruthy()
  })

  it("Should render sync findings without writing to console", async () => {
    const rootDir = await createFixtures({
      "src/app.ts": `
import { t } from "@lingui/core/macro"

t\`Hello World\`
        `,
    })

    const config = getTestConfig(rootDir)
    await extractCatalogs(config)
    await fs.promises.writeFile(
      `${rootDir}/src/app.ts`,
      `
import { t } from "@lingui/core/macro"

t\`Hello World\`
t\`New Message\`
        `,
      "utf-8",
    )

    const result = await runCheck(config, "sync", {
      workersOptions,
    })
    const rendered = renderCheckResult(result, true)

    expect(rendered[0]).toContain("FAIL sync")
    expect(rendered[1]).toBe(
      "locales/en/messages.po: Catalog is out of sync with extract output",
    )
  })
})

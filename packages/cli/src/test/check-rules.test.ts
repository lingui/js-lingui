import fs from "fs"
import { makeConfig } from "@lingui/conf"
import { mockConsole } from "@lingui/test-utils"
import {
  createProgram,
  getCheckStatus,
  renderCheckResult,
  runCheck,
  runChecks,
  runCliCommand,
} from "../lingui-check.js"
import { createFixtures } from "../tests.js"
import {
  extractCatalogs,
  getTestConfig,
  workersOptions,
} from "./checkTestUtils.js"

const SOURCE = `
import { t } from "@lingui/core/macro"

t\`Hello World\`
t({ message: "Bye", context: "farewell" })
`

/**
 * Catalogs which are in sync with the source code
 * but have no translations for the `pl` locale.
 */
async function createProject(configText?: string) {
  const rootDir = await createFixtures({
    "src/app.ts": SOURCE,
    ...(configText ? { "lingui.config.ts": configText } : {}),
  })

  await extractCatalogs(getTestConfig(rootDir))

  return rootDir
}

function getConfigText(check?: object) {
  return `export default ${JSON.stringify({
    locales: ["en", "pl"],
    sourceLocale: "en",
    catalogs: [
      {
        path: "<rootDir>/locales/{locale}/messages",
        include: ["<rootDir>/src"],
        exclude: [],
      },
    ],
    check,
  })}`
}

describe("Check: rules", () => {
  describe("run all", () => {
    it("Should run all checks by default, as errors", async () => {
      const rootDir = await createProject()

      const results = await runChecks(getTestConfig(rootDir), {
        workersOptions,
      })

      expect(results.map((result) => [result.name, result.passed])).toEqual([
        ["sync", true],
        ["missing", false],
      ])
      expect(results[1]!.level).toBe("on")
      expect(
        results[1]!.findings.every((finding) => finding.severity === "error"),
      ).toBe(true)
    })

    it("Should skip the checks which are turned off", async () => {
      const rootDir = await createProject()

      const results = await runChecks(
        getTestConfig(rootDir, { check: { rules: { missing: "off" } } }),
        { workersOptions },
      )

      expect(results.map((result) => result.name)).toEqual(["sync"])
    })

    it("Should return nothing when all checks are turned off", async () => {
      const rootDir = await createProject()

      const results = await runChecks(
        getTestConfig(rootDir, {
          check: { rules: { sync: "off", missing: { level: "off" } } },
        }),
        { workersOptions },
      )

      expect(results).toEqual([])
    })

    it("Should still run a turned off check when it is asked for by name", async () => {
      const rootDir = await createProject()

      const result = await runCheck(
        getTestConfig(rootDir, { check: { rules: { missing: "off" } } }),
        "missing",
        { workersOptions },
      )

      expect(result.passed).toBe(false)
    })
  })

  describe("levels", () => {
    it("Should not fail on warnings", async () => {
      const rootDir = await createProject()

      const result = await runCheck(
        getTestConfig(rootDir, { check: { rules: { missing: "warn" } } }),
        "missing",
        { workersOptions },
      )

      expect(result.level).toBe("warn")
      expect(result.passed).toBe(true)
      expect(result.findings).toHaveLength(2)
      expect(
        result.findings.every((finding) => finding.severity === "warn"),
      ).toBe(true)
      expect(getCheckStatus(result)).toBe("warn")
      expect(renderCheckResult(result, false).join("\n")).toContain(
        "WARN missing",
      )
    })

    it("Should apply the level given in the object form", async () => {
      const rootDir = await createProject()

      const result = await runCheck(
        getTestConfig(rootDir, {
          check: { rules: { missing: { level: "warn" } } },
        }),
        "missing",
        { workersOptions },
      )

      expect(result.level).toBe("warn")
      expect(result.passed).toBe(true)
    })

    it("Should use the level recommended by the check for `on`", async () => {
      const rootDir = await createProject()

      const result = await runCheck(
        getTestConfig(rootDir, {
          check: { rules: { missing: { level: "on" } } },
        }),
        "missing",
        { workersOptions },
      )

      expect(result.level).toBe("on")
      expect(result.passed).toBe(false)
      expect(getCheckStatus(result)).toBe("fail")
      expect(renderCheckResult(result, false).join("\n")).toContain(
        "FAIL missing",
      )
    })

    it("Should apply `error` to all kinds of problems", async () => {
      const rootDir = await createProject()

      const result = await runCheck(
        getTestConfig(rootDir, { check: { rules: { missing: "error" } } }),
        "missing",
        { workersOptions },
      )

      expect(result.level).toBe("error")
      expect(result.passed).toBe(false)
    })
  })

  describe("options", () => {
    async function createFallbackProject() {
      return await createFixtures({
        "locales/en-US/messages.po": `
msgid "Hello World"
msgstr "Hello World"
        `,
        "locales/en-GB/messages.po": `
msgid "Hello World"
msgstr ""
        `,
      })
    }

    function getFallbackConfig(rootDir: string, check?: object) {
      return makeConfig({
        locales: ["en-US", "en-GB"],
        sourceLocale: "en-US",
        fallbackLocales: { default: "en-US" },
        rootDir,
        catalogs: [
          {
            path: "<rootDir>/locales/{locale}/messages",
            include: ["<rootDir>/src"],
            exclude: [],
          },
        ],
        check,
      })
    }

    it("Should use options of the rule from the config", async () => {
      const rootDir = await createFallbackProject()
      const config = getFallbackConfig(rootDir, {
        rules: { missing: { level: "error", options: { mode: "catalog" } } },
      })

      const result = await runCheck(config, "missing", { workersOptions })

      expect(result.passed).toBe(false)
      expect(result.findings).toHaveLength(1)
    })

    it("Should prefer options passed explicitly over the config", async () => {
      const rootDir = await createFallbackProject()
      const config = getFallbackConfig(rootDir, {
        rules: { missing: { options: { mode: "catalog" } } },
      })

      const result = await runCheck(config, "missing", {
        workersOptions,
        missingBehavior: "resolved",
      })

      expect(result.passed).toBe(true)
    })

    it("Should use options of the rules when running all checks", async () => {
      const rootDir = await createFallbackProject()
      const config = getFallbackConfig(rootDir, {
        rules: { sync: "off", missing: { options: { mode: "catalog" } } },
      })

      const results = await runChecks(config, { workersOptions })

      expect(results.map((result) => [result.name, result.passed])).toEqual([
        ["missing", false],
      ])
    })

    it("Should use the `clean` option of the sync rule", async () => {
      const rootDir = await createProject()
      fs.appendFileSync(
        `${rootDir}/locales/en/messages.po`,
        `\n#~ msgid "Obsolete"\n#~ msgstr "Obsolete"\n`,
      )

      const withoutClean = await runCheck(
        getTestConfig(rootDir, { check: { rules: { missing: "off" } } }),
        "sync",
        { workersOptions },
      )
      const withClean = await runCheck(
        getTestConfig(rootDir, {
          check: { rules: { sync: { options: { clean: true } } } },
        }),
        "sync",
        { workersOptions },
      )

      expect(withoutClean.passed).toBe(true)
      expect(withClean.passed).toBe(false)
    })
  })

  describe("config validation", () => {
    it.each([
      [
        { rules: { unknown: "on" } },
        "Unknown check `unknown` in config option `check.rules`. Available checks: `sync`, `missing`.",
      ],
      [
        { rules: { missing: "strict" } },
        "Config option `check.rules.missing` must be one of `off`, `on`, `warn`, `error`.",
      ],
      [
        { rules: { missing: { level: "strict" } } },
        "Config option `check.rules.missing.level` must be one of `off`, `on`, `warn`, `error`.",
      ],
      [
        { rules: { missing: { options: { clean: true } } } },
        "Unknown option `clean` in config option `check.rules.missing.options`. Available options: `mode`.",
      ],
      [
        { rules: { missing: { options: { mode: "raw" } } } },
        "Config option `check.rules.missing.options.mode` must be one of `resolved`, `catalog`.",
      ],
      [
        { rules: { sync: { options: { clean: "yes" } } } },
        "Config option `check.rules.sync.options.clean` must be a boolean.",
      ],
      [
        { rules: { sync: { options: "clean" } } },
        "Config option `check.rules.sync.options` must be an object.",
      ],
    ])("Should reject %j", async (check, message) => {
      const rootDir = await createProject()
      const config = getTestConfig(rootDir, { check: check as any })

      await expect(runChecks(config, { workersOptions })).rejects.toThrow(
        message,
      )
      await expect(
        runCheck(config, "sync", { workersOptions }),
      ).rejects.toThrow(message)
    })
  })

  describe("findings", () => {
    it("Should point a missing translation to the message", async () => {
      const rootDir = await createFixtures({
        "locales/en/messages.po": `
#: src/app.ts:3
msgid "Hello World"
msgstr "Hello World"

#: src/app.ts:4
#: src/other.ts:7
msgctxt "farewell"
msgid "Bye"
msgstr "Bye"
        `,
        "locales/pl/messages.po": `
#: src/app.ts:3
msgid "Hello World"
msgstr ""

#: src/app.ts:4
#: src/other.ts:7
msgctxt "farewell"
msgid "Bye"
msgstr ""
        `,
      })

      const result = await runCheck(getTestConfig(rootDir), "missing", {
        workersOptions,
      })

      const hello = result.findings.find((finding) =>
        finding.message.includes("Hello World"),
      )
      const bye = result.findings.find((finding) =>
        finding.message.includes("Bye"),
      )

      expect(result.findings).toHaveLength(2)
      expect(hello).toMatchObject({
        code: "missing_translation",
        locale: "pl",
        id: "mY42CM",
        origin: [["src/app.ts", 3]],
      })
      expect(hello).not.toHaveProperty("context")
      expect(bye).toMatchObject({
        code: "missing_translation",
        locale: "pl",
        id: "m-H3N3",
        context: "farewell",
        origin: [
          ["src/app.ts", 4],
          ["src/other.ts", 7],
        ],
      })
    })
  })

  describe("CLI", () => {
    it("Should exit with an error only for findings with the error severity", async () => {
      const rootDir = await createProject(
        getConfigText({ rules: { missing: "warn" } }),
      )

      await mockConsole(async (console) => {
        expect(
          await runCliCommand(undefined, {
            config: `${rootDir}/lingui.config.ts`,
            workers: 1,
          }),
        ).toBe(true)

        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining("WARN missing"),
        )
        expect(console.error).not.toHaveBeenCalled()
      })

      await mockConsole(async (console) => {
        expect(
          await runCliCommand("missing", {
            config: `${rootDir}/lingui.config.ts`,
            workers: 1,
          }),
        ).toBe(true)
        expect(console.warn).toHaveBeenCalled()
      })
    })

    it("Should fail when a check reports an error", async () => {
      const rootDir = await createProject(getConfigText())

      await mockConsole(async (console) => {
        expect(
          await runCliCommand(undefined, {
            config: `${rootDir}/lingui.config.ts`,
            workers: 1,
          }),
        ).toBe(false)

        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining("PASS sync"),
        )
        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining("FAIL missing"),
        )
      })
    })

    it("Should tell when all checks are turned off", async () => {
      const rootDir = await createProject(
        getConfigText({ rules: { sync: "off", missing: "off" } }),
      )

      await mockConsole(async (console) => {
        expect(
          await runCliCommand(undefined, {
            config: `${rootDir}/lingui.config.ts`,
            workers: 1,
          }),
        ).toBe(true)

        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining("All checks are turned off"),
        )
      })
    })

    it("Should print a single JSON document with --format json", async () => {
      const rootDir = await createProject(getConfigText())

      await mockConsole(async (console) => {
        expect(
          await runCliCommand(undefined, {
            config: `${rootDir}/lingui.config.ts`,
            workers: 1,
            format: "json",
          }),
        ).toBe(false)

        expect(console.log).toHaveBeenCalledTimes(1)
        expect(console.warn).not.toHaveBeenCalled()
        expect(console.error).not.toHaveBeenCalled()

        const report = JSON.parse(console.log.mock.calls[0]![0])

        expect(report).toMatchObject({
          version: 1,
          passed: false,
          errors: [],
        })
        expect(report.checks.map((check: any) => check.name)).toEqual([
          "sync",
          "missing",
        ])
        expect(report.checks[0]).toMatchObject({
          level: "on",
          passed: true,
          findings: [],
        })
        expect(report.checks[1].findings).toHaveLength(2)
        expect(report.checks[1].findings).toContainEqual({
          code: "missing_translation",
          severity: "error",
          message: "mY42CM: (Hello World)",
          catalogPath: "locales/pl/messages.po",
          locale: "pl",
          id: "mY42CM",
          origin: [{ file: "src/app.ts", line: 4 }],
        })
        expect(report.checks[1].findings).toContainEqual({
          code: "missing_translation",
          severity: "error",
          message: "m-H3N3: (Bye)",
          catalogPath: "locales/pl/messages.po",
          locale: "pl",
          id: "m-H3N3",
          context: "farewell",
          origin: [{ file: "src/app.ts", line: 5 }],
        })
      })
    })

    it("Should pass in JSON when there are only warnings", async () => {
      const rootDir = await createProject(
        getConfigText({ rules: { missing: "warn" } }),
      )

      await mockConsole(async (console) => {
        expect(
          await runCliCommand("missing", {
            config: `${rootDir}/lingui.config.ts`,
            workers: 1,
            format: "json",
          }),
        ).toBe(true)

        const report = JSON.parse(console.log.mock.calls[0]![0])
        expect(report.passed).toBe(true)
        expect(report.checks[0].level).toBe("warn")
        expect(report.checks[0].findings[0].severity).toBe("warn")
      })
    })

    it("Should keep errors of the run apart from findings in JSON", async () => {
      const rootDir = await createProject(
        getConfigText({ rules: { missing: "strict" } }),
      )

      await mockConsole(async (console) => {
        expect(
          await runCliCommand(undefined, {
            config: `${rootDir}/lingui.config.ts`,
            workers: 1,
            format: "json",
          }),
        ).toBe(false)

        expect(console.log).toHaveBeenCalledTimes(1)
        expect(JSON.parse(console.log.mock.calls[0]![0])).toEqual({
          version: 1,
          passed: false,
          errors: [
            {
              message:
                "Config option `check.rules.missing` must be one of `off`, `on`, `warn`, `error`.",
            },
          ],
          checks: [],
        })
      })
    })

    it("Should print a JSON document when the config can't be loaded", async () => {
      await mockConsole(async (console) => {
        expect(
          await runCliCommand(undefined, {
            config: "/not/existing/lingui.config.ts",
            format: "json",
          }),
        ).toBe(false)

        expect(console.log).toHaveBeenCalledTimes(1)
        const report = JSON.parse(console.log.mock.calls[0]![0])
        expect(report.passed).toBe(false)
        expect(report.errors).toHaveLength(1)
        expect(report.checks).toEqual([])
      })
    })

    it("Should throw errors of the run in text mode", async () => {
      await mockConsole(async () => {
        await expect(
          runCliCommand(undefined, {
            config: "/not/existing/lingui.config.ts",
          }),
        ).rejects.toThrow()
      })
    })

    it("Should run all checks when no check is given", async () => {
      const rootDir = await createProject(getConfigText())
      const program = createProgram()
      program.exitOverride()

      await mockConsole(async (console) => {
        await program.parseAsync([
          "node",
          "lingui-check",
          "--config",
          `${rootDir}/lingui.config.ts`,
          "--workers",
          "1",
          "--format",
          "json",
        ])

        const report = JSON.parse(console.log.mock.calls[0]![0])
        expect(report.checks.map((check: any) => check.name)).toEqual([
          "sync",
          "missing",
        ])
      })

      expect(process.exitCode).toBe(1)
      process.exitCode = undefined
    })

    it("Should pass options given before the check name to the check", async () => {
      const rootDir = await createProject(getConfigText())
      const program = createProgram()
      program.exitOverride()

      await mockConsole(async (console) => {
        await program.parseAsync([
          "node",
          "lingui-check",
          "--config",
          `${rootDir}/lingui.config.ts`,
          "--format",
          "json",
          "missing",
          "--workers",
          "1",
        ])

        const report = JSON.parse(console.log.mock.calls[0]![0])
        expect(report.checks.map((check: any) => check.name)).toEqual([
          "missing",
        ])
      })

      process.exitCode = undefined
    })

    it("Should reject an unknown format", async () => {
      const program = createProgram()
      program.exitOverride()
      program.configureOutput({ writeOut: () => {}, writeErr: () => {} })

      await expect(
        program.parseAsync(["node", "lingui-check", "--format", "xml"]),
      ).rejects.toMatchObject({ code: "commander.invalidArgument" })
    })

    it("Should reject an unknown check", async () => {
      const program = createProgram()
      program.exitOverride()
      program.configureOutput({ writeOut: () => {}, writeErr: () => {} })

      await expect(
        program.parseAsync(["node", "lingui-check", "unknown"]),
      ).rejects.toMatchObject({ code: "commander.excessArguments" })
    })
  })
})

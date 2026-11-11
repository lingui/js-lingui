import { styleText } from "node:util"
import { Command, InvalidArgumentError } from "commander"
import ms from "ms"

import { getConfig, LinguiConfigNormalized } from "@lingui/conf"
import { helpRun } from "./api/help.js"
import { getCatalogs } from "./api/index.js"
import {
  getCheck,
  getRegisteredChecks,
  validateSupportedOptions,
} from "./api/check/index.js"
import {
  CheckCliExample,
  CheckDefinition,
  CheckLevel,
  CheckName,
  CheckRunOptions,
  CheckResult,
} from "./api/check/types.js"
import {
  getFindingSeverity,
  resolveCheckRule,
  validateCheckRules,
} from "./api/check/rules.js"
import { createCheckReport } from "./api/check/report.js"
import type { Catalog } from "./api/catalog.js"
import { resolveWorkersOptions } from "./api/resolveWorkersOptions.js"
import { isMissingBehavior } from "./api/catalog/getTranslationsForCatalog.js"
import type { MissingBehavior } from "./api/catalog/getTranslationsForCatalog.js"

type OutputFormat = "text" | "json"

type SharedCliArgs = {
  config?: string
  locale?: string[]
  verbose?: boolean
  workers?: number | string
  format?: OutputFormat
}

type CheckSpecificOptions = {
  clean?: boolean
  overwrite?: boolean
  mode?: MissingBehavior
}

/**
 * `fail` if there is a finding with the `error` severity, `warn` if there are only
 * warnings.
 */
export function getCheckStatus(result: CheckResult): "pass" | "warn" | "fail" {
  if (!result.passed) {
    return "fail"
  }

  return result.findings.length ? "warn" : "pass"
}

export function renderCheckResult(result: CheckResult, verbose: boolean) {
  const status = {
    pass: styleText("green", "PASS"),
    warn: styleText("yellow", "WARN"),
    fail: styleText("red", "FAIL"),
  }[getCheckStatus(result)]
  const lines = [`${status} ${result.name}: ${result.summary}`]

  if (verbose) {
    lines.push(
      ...result.findings.map(
        (finding) => `${finding.catalogPath}: ${finding.message}`,
      ),
    )
  }

  return lines
}

function validateLocales(
  config: LinguiConfigNormalized,
  locales: string[] | undefined,
): string[] {
  if (!locales?.length) {
    return config.locales
  }

  const missingLocale = locales.find(
    (locale) => !config.locales.includes(locale),
  )

  if (missingLocale) {
    throw new Error(
      `Locale ${styleText("bold", missingLocale)} does not exist.`,
    )
  }

  return locales
}

async function executeCheck(
  config: LinguiConfigNormalized,
  checkDefinition: CheckDefinition,
  catalogs: Catalog[],
  options: CheckRunOptions,
): Promise<CheckResult> {
  validateSupportedOptions(checkDefinition, options)
  const locales = validateLocales(config, options.locale)

  // The rule from the config applies to the options which were not set explicitly
  const rule = resolveCheckRule(config, checkDefinition)
  // A check which is asked for by name runs even if it's turned off in the config
  const level: CheckLevel = rule.level === "off" ? "on" : rule.level

  const { findings, summary } = await checkDefinition.run({
    config,
    catalogs,
    locales,
    workersOptions: options.workersOptions,
    clean: options.clean ?? rule.options.clean ?? false,
    overwrite: options.overwrite ?? rule.options.overwrite ?? false,
    missingBehavior:
      options.missingBehavior ?? rule.options.missingBehavior ?? "resolved",
  })

  const reportedFindings = findings.map((finding) => ({
    ...finding,
    severity: getFindingSeverity(checkDefinition, level, finding),
  }))

  return {
    name: checkDefinition.name,
    level,
    passed: reportedFindings.every((finding) => finding.severity !== "error"),
    findings: reportedFindings,
    summary,
  }
}

export async function runCheck(
  config: LinguiConfigNormalized,
  check: CheckName,
  options: CheckRunOptions,
): Promise<CheckResult> {
  const checkDefinition = getCheck(check)
  validateCheckRules(config, getRegisteredChecks())

  return await executeCheck(
    config,
    checkDefinition,
    await getCatalogs(config),
    options,
  )
}

/**
 * Runs all checks which are not turned off by `check.rules` in the config.
 */
export async function runChecks(
  config: LinguiConfigNormalized,
  options: CheckRunOptions,
): Promise<CheckResult[]> {
  validateCheckRules(config, getRegisteredChecks())

  const enabledChecks = getRegisteredChecks().filter(
    (check) => resolveCheckRule(config, check).level !== "off",
  )

  if (!enabledChecks.length) {
    return []
  }

  const catalogs = await getCatalogs(config)
  const results: CheckResult[] = []

  // Checks run one by one, each of them already uses all workers
  for (const check of enabledChecks) {
    results.push(await executeCheck(config, check, catalogs, options))
  }

  return results
}

function parseLocales(value: string) {
  return value
    .split(",")
    .map((locale) => locale.trim())
    .filter(Boolean)
}

function parseFormat(value: string): OutputFormat {
  if (value === "text" || value === "json") {
    return value
  }

  throw new InvalidArgumentError("Must be either `text` or `json`.")
}

function addCommonOptions<T extends Command>(command: T): T {
  return command
    .option("--config <path>", "Path to the config file")
    .option(
      "--locale <locale, [...]>",
      "Only check the specified locales",
      parseLocales,
    )
    .option(
      "--workers <n>",
      "Number of worker threads to use (default: CPU count - 1, capped at 8; on 1-2 core machines, all cores). Pass `--workers 1` to disable worker threads and run everything in a single process",
    )
    .option("--verbose", "Verbose output")
    .option(
      "--format <format>",
      "Output format: text (default) or json. The json output is a single document printed to stdout",
      parseFormat,
    )
}

function parseMissingBehavior(value: string): MissingBehavior {
  if (isMissingBehavior(value)) {
    return value
  }

  throw new Error("Option `--mode` must be either `resolved` or `catalog`.")
}

function renderHelpExamples(examples: readonly CheckCliExample[]) {
  if (!examples.length) {
    return
  }

  console.log("\n  Examples:\n")
  examples.forEach((example, index) => {
    console.log(`    # ${example.description}`)
    console.log(`    $ ${helpRun(example.command)}`)

    if (index < examples.length - 1) {
      console.log("")
    }
  })
}

/**
 * Runs the given check, or all enabled checks if no check is given.
 * Resolves to `false` if the run should exit with a non-zero code.
 */
export async function runCliCommand(
  check: CheckName | undefined,
  options: SharedCliArgs & CheckSpecificOptions,
): Promise<boolean> {
  const startTime = Date.now()
  const json = options.format === "json"
  const verbose = options.verbose ?? false

  let results: CheckResult[]

  try {
    const config = getConfig({ configPath: options.config })

    if (!json) {
      console.log("Checking message catalogs…")
    }

    const runOptions = {
      locale: options.locale,
      workersOptions: resolveWorkersOptions(options),
      clean: options.clean,
      overwrite: options.overwrite,
      missingBehavior: options.mode,
    }

    results = check
      ? [await runCheck(config, check, runOptions)]
      : await runChecks(config, runOptions)
  } catch (error) {
    if (!json) {
      throw error
    }

    console.log(JSON.stringify(createCheckReport([], [error]), null, 2))
    return false
  }

  if (json) {
    const report = createCheckReport(results)
    console.log(JSON.stringify(report, null, 2))
    return report.passed
  }

  if (!results.length) {
    console.log("All checks are turned off in the `check.rules` config option.")
  }

  results.forEach((result) => {
    const output = {
      pass: console.log,
      warn: console.warn,
      fail: console.error,
    }[getCheckStatus(result)]

    renderCheckResult(result, verbose).forEach((line) => {
      output(line)
    })
  })

  console.log(`Done in ${ms(Date.now() - startTime)}`)

  return results.every((result) => result.passed)
}

function registerCheckCommand(checkProgram: Command, check: CheckDefinition) {
  const command = addCommonOptions(
    checkProgram.command(check.name).description(check.description),
  )

  check.cli.options.forEach((option) => {
    if (option.name === "mode") {
      command.option(
        `--${option.name} <mode>`,
        option.description,
        parseMissingBehavior,
      )
      return
    }

    command.option(`--${option.name}`, option.description)
  })

  command
    .on("--help", function () {
      renderHelpExamples(check.cli.examples)
    })
    .action(
      async (_: SharedCliArgs & CheckSpecificOptions, subcommand: Command) => {
        // options given before the name of the check belong to the parent command
        const options = subcommand.optsWithGlobals<
          SharedCliArgs & CheckSpecificOptions
        >()

        if (!(await runCliCommand(check.name, options))) {
          process.exitCode = 1
        }
      },
    )
}

export function createProgram() {
  const checkProgram = addCommonOptions(
    new Command()
      .name("lingui check")
      .description(
        "Check message catalogs. Runs all enabled checks, or only the given one.",
      ),
  )
    .allowExcessArguments(false)
    .action(async (options: SharedCliArgs) => {
      if (!(await runCliCommand(undefined, options))) {
        process.exitCode = 1
      }
    })
    .on("--help", function () {
      renderHelpExamples([
        {
          description: "Run all checks which are enabled in the config",
          command: "check",
        },
        {
          description: "Print the results as JSON",
          command: "check --format json",
        },
        ...getRegisteredChecks().flatMap((check) => check.cli.examples),
      ])
    })

  getRegisteredChecks().forEach((check) => {
    registerCheckCommand(checkProgram, check)
  })

  return checkProgram
}

if (import.meta.main) {
  createProgram()
    .parseAsync(process.argv)
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error))
      process.exit(1)
    })
}

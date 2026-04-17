import { styleText } from "node:util"
import { Command } from "commander"
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
  CheckName,
  CheckRunOptions,
  CheckResult,
  CheckSpecificOption,
} from "./api/check/types.js"
import { resolveWorkersOptions } from "./api/resolveWorkersOptions.js"

type SharedCliArgs = {
  config?: string
  locale?: string[]
  verbose?: boolean
  workers?: number | string
}

type CheckSpecificOptions = Partial<Record<CheckSpecificOption, boolean>>

export function renderCheckResult(result: CheckResult, verbose: boolean) {
  const status = result.passed
    ? styleText("green", "PASS")
    : styleText("red", "FAIL")
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

export async function runCheck(
  config: LinguiConfigNormalized,
  check: CheckName,
  options: CheckRunOptions,
): Promise<CheckResult> {
  const checkDefinition = getCheck(check)
  validateSupportedOptions(checkDefinition, options)
  const locales = validateLocales(config, options.locale)
  const catalogs = await getCatalogs(config)

  return await checkDefinition.run({
    config,
    catalogs,
    locales,
    workersOptions: options.workersOptions,
    clean: options.clean ?? false,
    overwrite: options.overwrite ?? false,
  })
}

function parseLocales(value: string) {
  return value
    .split(",")
    .map((locale) => locale.trim())
    .filter(Boolean)
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
      "Number of worker threads to use (default: based on CPU count, capped at 8, with special handling for small machines). Pass `--workers 1` to disable worker threads and run everything in a single process",
    )
    .option("--verbose", "Verbose output")
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

async function runCliCommand(
  check: CheckName,
  options: SharedCliArgs & CheckSpecificOptions,
) {
  const startTime = Date.now()
  const config = getConfig({ configPath: options.config })
  const verbose = options.verbose ?? false

  console.log("Checking message catalogs…")

  const result = await runCheck(config, check, {
    locale: options.locale,
    workersOptions: resolveWorkersOptions(options),
    clean: options.clean ?? false,
    overwrite: options.overwrite ?? false,
  })

  const output = result.passed ? console.log : console.error
  renderCheckResult(result, verbose).forEach((line) => {
    output(line)
  })

  console.log(`Done in ${ms(Date.now() - startTime)}`)

  return result.passed
}

function registerCheckCommand(checkProgram: Command, check: CheckDefinition) {
  const command = addCommonOptions(
    checkProgram.command(check.name).description(check.description),
  )

  check.cli.options.forEach((option) => {
    command.option(`--${option.name}`, option.description)
  })

  command
    .on("--help", function () {
      renderHelpExamples(check.cli.examples)
    })
    .action(async (options: SharedCliArgs & CheckSpecificOptions) => {
      if (!(await runCliCommand(check.name, options))) {
        process.exitCode = 1
      }
    })
}

export function createProgram() {
  const checkProgram = new Command()
    .name("lingui check")
    .description("Check message catalogs.")
    .action(() => {
      checkProgram.help({ error: true })
    })
    .on("--help", function () {
      renderHelpExamples(
        getRegisteredChecks().flatMap((check) => check.cli.examples),
      )
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
      console.error((error as Error).message)
      process.exit(1)
    })
}

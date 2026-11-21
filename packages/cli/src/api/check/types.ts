import type { CheckRuleLevel, LinguiConfigNormalized } from "@lingui/conf"
import { Catalog } from "../catalog.js"
import { WorkersOptions } from "../resolveWorkersOptions.js"
import type { MissingTranslationFinding } from "../catalog/translations.js"
import type { MissingBehavior } from "../catalog/getTranslationsForCatalog.js"

export type CheckFindingBase = {
  catalogPath: string
  message: string
}

export type CheckName = "sync" | "missing"
export const checkSpecificOptions = [
  "clean",
  "overwrite",
  "missingBehavior",
] as const
export type CheckSpecificOption = (typeof checkSpecificOptions)[number]
export type CheckCliOptionName = "clean" | "overwrite" | "mode"

export type CheckCliExample = {
  description: string
  command: string
}

export type CheckCliOptionDefinition = {
  /**
   * Name of the CLI flag. The same name is used for the option
   * in the `check.rules.<check>.options` config.
   */
  name: CheckCliOptionName
  runOption: CheckSpecificOption
  description: string
  /** Allowed values of the option. Options without choices are boolean flags. */
  choices?: readonly string[]
}

export type CatalogOutOfSyncFinding = CheckFindingBase & {
  code: "catalog_out_of_sync"
  locale: string
}

export type ExtractFailedFinding = CheckFindingBase & {
  code: "extract_failed"
}

export type CheckFinding =
  MissingTranslationFinding | CatalogOutOfSyncFinding | ExtractFailedFinding

/**
 * How a finding is treated by the run:
 * `error` fails the run, `warn` is printed but doesn't affect the exit code.
 */
export type CheckSeverity = "warn" | "error"

export type CheckFindingCode = CheckFinding["code"]

/**
 * Severity which `on` level assigns to each kind of problem the check can report.
 */
export type CheckProblemLevels = Record<CheckFindingCode, CheckSeverity>

/** What a check returns, severities are not assigned yet. */
export type CheckRunResult = {
  name: CheckName
  findings: CheckFinding[]
  summary: string
}

export type ReportedFinding = CheckFinding & {
  severity: CheckSeverity
}

export type CheckResult = {
  name: CheckName
  /** the level the check was run with */
  level: CheckLevel
  /** `false` if there is at least one finding with the `error` severity */
  passed: boolean
  findings: ReportedFinding[]
  summary: string
}

/**
 * The level of a check as it is configured, `off` is resolved before the run.
 */
export type CheckLevel = Exclude<CheckRuleLevel, "off">

/**
 * Options of the checks given in `check.rules.<check>.options`.
 */
export type CheckConfigOptions = Pick<
  CheckRunOptions,
  "clean" | "overwrite" | "missingBehavior"
>

export type CheckContext = {
  config: LinguiConfigNormalized
  catalogs: Catalog[]
  locales: string[]
  workersOptions: WorkersOptions
  clean: boolean
  overwrite: boolean
  missingBehavior: MissingBehavior
}

export type CheckRunOptions = {
  locale?: string[]
  workersOptions: WorkersOptions
  clean?: boolean
  overwrite?: boolean
  missingBehavior?: MissingBehavior
}

export type CheckDefinition = {
  name: CheckName
  description: string
  /**
   * Level which `check.rules.<check>: "on"` assigns to each kind of problem
   * the check can report.
   */
  problems: Partial<CheckProblemLevels>
  cli: {
    options: readonly CheckCliOptionDefinition[]
    examples: readonly CheckCliExample[]
  }
  run: (ctx: CheckContext) => Promise<CheckRunResult>
}

export function finalizeCheckResult(
  name: CheckName,
  findings: CheckFinding[],
  passMessage: string,
  failMessage: (count: number) => string,
): CheckRunResult {
  return {
    name,
    findings,
    summary: findings.length === 0 ? passMessage : failMessage(findings.length),
  }
}

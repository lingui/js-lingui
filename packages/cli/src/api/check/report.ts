import type {
  CheckFindingCode,
  CheckName,
  CheckResult,
  CheckSeverity,
  ReportedFinding,
} from "./types.js"

/** Bump when the shape of the JSON report changes in a breaking way. */
export const CHECK_REPORT_VERSION = 1

export type CheckReportOrigin = { file: string; line?: number }

export type CheckReportFinding = {
  code: CheckFindingCode
  severity: CheckSeverity
  message: string
  /** catalog file, relative to the `rootDir` */
  catalogPath: string
  locale?: string
  /** id of the message the finding is about, only for findings about a message */
  id?: string
  context?: string
  /** places in the source code where the message is used */
  origin?: CheckReportOrigin[]
}

export type CheckReport = {
  version: typeof CHECK_REPORT_VERSION
  /** `false` if the run has errors or any check has a finding with the `error` severity */
  passed: boolean
  /** problems of the run itself, like a config which can't be loaded. Not findings. */
  errors: { message: string }[]
  checks: Array<{
    name: CheckName
    level: CheckResult["level"]
    passed: boolean
    summary: string
    findings: CheckReportFinding[]
  }>
}

function createReportFinding(finding: ReportedFinding): CheckReportFinding {
  const reported: CheckReportFinding = {
    code: finding.code,
    severity: finding.severity,
    message: finding.message,
    catalogPath: finding.catalogPath,
  }

  if ("locale" in finding) {
    reported.locale = finding.locale
  }

  if (finding.code === "missing_translation") {
    reported.id = finding.id

    if (finding.context !== undefined) {
      reported.context = finding.context
    }

    if (finding.origin) {
      reported.origin = finding.origin.map(([file, line]) =>
        line == null ? { file } : { file, line },
      )
    }
  }

  return reported
}

export function createCheckReport(
  results: CheckResult[],
  errors: unknown[] = [],
): CheckReport {
  return {
    version: CHECK_REPORT_VERSION,
    passed: errors.length === 0 && results.every((result) => result.passed),
    errors: errors.map((error) => ({
      message: error instanceof Error ? error.message : String(error),
    })),
    checks: results.map((result) => ({
      name: result.name,
      level: result.level,
      passed: result.passed,
      summary: result.summary,
      findings: result.findings.map(createReportFinding),
    })),
  }
}

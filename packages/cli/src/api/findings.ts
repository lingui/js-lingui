export type CheckSeverity = "warn" | "error"

export type CheckFindingBase = {
  catalogPath: string
  message: string
  severity: CheckSeverity
}

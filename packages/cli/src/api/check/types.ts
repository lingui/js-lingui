import { LinguiConfigNormalized } from "@lingui/conf"
import { Catalog } from "../catalog.js"
import { MissingTranslationFinding } from "../catalog/translations.js"
import { CheckFindingBase } from "../findings.js"
import { WorkersOptions } from "../resolveWorkersOptions.js"

export type CheckName = "sync" | "missing"
export const checkSpecificOptions = ["clean", "overwrite"] as const
export type CheckSpecificOption = (typeof checkSpecificOptions)[number]

export type CheckCliExample = {
  description: string
  command: string
}

export type CheckCliOptionDefinition = {
  name: CheckSpecificOption
  description: string
}

export type CatalogOutOfSyncFinding = CheckFindingBase & {
  code: "catalog_out_of_sync"
  locale: string
}

export type ExtractFailedFinding = CheckFindingBase & {
  code: "extract_failed"
}

export type CheckFinding =
  | MissingTranslationFinding
  | CatalogOutOfSyncFinding
  | ExtractFailedFinding

export type CheckResult = {
  name: CheckName
  passed: boolean
  findings: CheckFinding[]
  summary: string
}

export type CheckContext = {
  config: LinguiConfigNormalized
  catalogs: Catalog[]
  locales: string[]
  workersOptions: WorkersOptions
  clean: boolean
  overwrite: boolean
}

export type CheckRunOptions = {
  locale?: string[]
  workersOptions: WorkersOptions
  clean?: boolean
  overwrite?: boolean
}

export type CheckDefinition = {
  name: CheckName
  description: string
  cli: {
    options: readonly CheckCliOptionDefinition[]
    examples: readonly CheckCliExample[]
  }
  run: (ctx: CheckContext) => Promise<CheckResult>
}

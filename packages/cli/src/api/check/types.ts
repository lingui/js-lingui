import { LinguiConfigNormalized } from "@lingui/conf"
import { Catalog } from "../catalog.js"
import { MissingTranslationFinding } from "../catalog/translations.js"
import { CheckFindingBase } from "../findings.js"
import { WorkersOptions } from "../resolveWorkersOptions.js"
import type { MissingBehavior } from "../catalog/getTranslationsForCatalog.js"

export type CheckName = "sync" | "missing"
export type CheckSpecificOption = "clean" | "overwrite" | "missingBehavior"
export const checkSpecificOptions: readonly CheckSpecificOption[] = [
  "clean",
  "overwrite",
  "missingBehavior",
]
export type CheckCliOptionName = "clean" | "overwrite" | "mode"

export type CheckCliExample = {
  description: string
  command: string
}

export type CheckCliOptionDefinition = {
  name: CheckCliOptionName
  runOption: CheckSpecificOption
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
  cli: {
    options: readonly CheckCliOptionDefinition[]
    examples: readonly CheckCliExample[]
  }
  run: (ctx: CheckContext) => Promise<CheckResult>
}

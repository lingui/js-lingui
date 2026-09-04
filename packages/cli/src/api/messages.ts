import type {
  MissingBehavior,
  TranslationMissingEvent,
} from "./catalog/getTranslationsForCatalog.js"
import { styleText } from "node:util"
import type { MessageCompilationError } from "./compile.js"

export function getMissingBehaviorDescription(
  missingBehavior: MissingBehavior,
) {
  return missingBehavior === "catalog"
    ? "before applying fallbackLocales"
    : "after applying fallbackLocales"
}

export type FailOnMissingOption = boolean | MissingBehavior

export function isFailOnMissingEnabled(
  option: FailOnMissingOption | undefined,
) {
  return option === true || option === "resolved" || option === "catalog"
}

export function getFailOnMissingBehavior(
  option: FailOnMissingOption | undefined,
): MissingBehavior {
  return option === "catalog" ? "catalog" : "resolved"
}

export function formatFailOnMissingOption(
  option: FailOnMissingOption | undefined,
) {
  if (option === true) return "true"
  if (option === "resolved") return '"resolved"'
  if (option === "catalog") return '"catalog"'
  return "false"
}

export function createMissingErrorMessage(
  locale: string,
  missingMessages: TranslationMissingEvent[],
  missingBehavior: MissingBehavior = "resolved",
) {
  let message = `Failed to compile catalog for locale ${styleText("bold", locale)}!

Missing ${missingMessages.length} translation(s) ${getMissingBehaviorDescription(missingBehavior)}:
\n`

  missingMessages.forEach((missing) => {
    const source =
      missing.source || missing.source === missing.id
        ? `: ${missing.source}`
        : ""

    message += `${missing.id}${source}\n`
  })

  return message
}

export function createCompilationErrorMessage(
  locale: string,
  errors: MessageCompilationError[],
) {
  let message = `Failed to compile catalog for locale ${styleText("bold", locale)}!

Compilation error for ${errors.length} translation(s):
\n`

  errors.forEach((error) => {
    const source =
      error.source || error.source === error.id ? `: ${error.source}` : ""

    message += `${error.id}${source}\nReason: ${error.error.message}\n\n`
  })

  return message
}

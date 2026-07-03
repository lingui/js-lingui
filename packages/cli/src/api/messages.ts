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

function isMissingBehavior(value: string): value is MissingBehavior {
  return value === "resolved" || value === "catalog"
}

export function createMissingErrorMessage(
  locale: string,
  missingMessages: TranslationMissingEvent[],
  missingBehaviorOrConfigurationMsg: MissingBehavior | string = "resolved",
) {
  const missingBehavior = isMissingBehavior(missingBehaviorOrConfigurationMsg)
    ? missingBehaviorOrConfigurationMsg
    : "resolved"

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

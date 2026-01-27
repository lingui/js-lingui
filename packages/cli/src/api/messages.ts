import { TranslationMissingEvent } from "./catalog/getTranslationsForCatalog.js"
import pico from "picocolors"
import { MessageCompilationError } from "./compile.js"

export function createMissingErrorMessage(
  locale: string,
  missingMessages: TranslationMissingEvent[],
  configurationMsg: string,
) {
  let message = `Failed to compile catalog for locale ${pico.bold(locale)}!

Missing ${missingMessages.length} translation(s):
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
  let message = `Failed to compile catalog for locale ${pico.bold(locale)}!

Compilation error for ${errors.length} translation(s):
\n`

  errors.forEach((error) => {
    const source =
      error.source || error.source === error.id ? `: ${error.source}` : ""

    message += `${error.id}${source}\nReason: ${error.error.message}\n\n`
  })

  return message
}

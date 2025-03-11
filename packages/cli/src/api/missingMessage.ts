import { TranslationMissingEvent } from "./catalog/getTranslationsForCatalog"
import chalk from "chalk"

export function createMissingErrorMessage(
  locale: string,
  missingMessages: TranslationMissingEvent[],
  configurationMsg: string
) {
  let message = `
Failed to compile catalog for locale ${chalk.bold(locale)}!

Missing ${missingMessages.length} translation(s):
\n`

  missingMessages.forEach((missing) => {
    const source =
      missing.source || missing.source === missing.id
        ? `: ${missing.source}`
        : ""

    message += `${missing.id}${source}\n`
  })

  message += `\nYou see this error because \`failOnMissing=true\` in Lingui ${configurationMsg} configuration.`
  return message
}

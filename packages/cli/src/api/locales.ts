import * as plurals from "make-plural/plurals"
import bcp47 from "bcp-47"

export type LocaleInfo = {
  locale: string
  language: string
}

/**
 * Check that locale is valid according to BCP47 and we have plurals for it
 * @param locale: string - Locale in BCP47 format
 * @return {boolean}
 */
export function isValid(locale: string): boolean {
  const localeData = parse(locale)
  return (
    localeData !== null &&
    localeData !== undefined &&
    localeData.language in plurals
  )
}

/**
 * Parse locale in BCP47 format and
 * @param locale - Locale in BCP47 format
 * @return {LocaleInfo}
 */
export function parse(locale: string): LocaleInfo | null {
  if (typeof locale !== "string") return null

  const schema = bcp47.parse(locale.replace("_", "-"))
  if (!schema.language) return null

  return {
    locale: bcp47.stringify(schema),
    language: schema.language,
  }
}

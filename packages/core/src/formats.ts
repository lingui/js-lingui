import { isString } from "./essentials"
import { Locales } from "./i18n"

/** Memoized cache */
const cache = new Map<string, unknown>()

export function date(
  locales: Locales,
  value: string | Date,
  format: Intl.DateTimeFormatOptions = {}
): string {
  const formatter = getMemoized(
    () => cacheKey("date", locales, format),
    () => new Intl.DateTimeFormat(locales, format)
  )

  return formatter.format(isString(value) ? new Date(value) : value)
}

export function number(
  locales: Locales,
  value: number,
  format: Intl.NumberFormatOptions = {}
): string {
  const formatter = getMemoized(
    () => cacheKey("number", locales, format),
    () => new Intl.NumberFormat(locales, format)
  )

  return formatter.format(value)
}

export function plural(
  locale: string,
  ordinal: boolean,
  value: number,
  { offset = 0, ...rules }
): string {
  const plurals = ordinal
    ? getMemoized(
        () => cacheKey("plural-ordinal", locale, {}),
        () => new Intl.PluralRules([locale, "en"], { type: "ordinal" })
      )
    : getMemoized(
        () => cacheKey("plural-cardinal", locale, {}),
        () => new Intl.PluralRules([locale, "en"], { type: "cardinal" })
      )

  return rules[value] || rules[plurals.select(value - offset)] || rules.other
}

function getMemoized<T>(getKey: () => string, construct: () => T) {
  const key = getKey()

  let formatter = cache.get(key) as T

  if (!formatter) {
    formatter = construct()
    cache.set(key, formatter)
  }

  return formatter
}

function cacheKey(
  type: string,
  locales?: string | string[],
  options: unknown = {}
) {
  const localeKey = Array.isArray(locales) ? locales.sort().join("-") : locales
  return `${type}-${localeKey}-${JSON.stringify(options)}`
}

import { isString } from "./essentials"
import { Locales } from "./i18n"

/** Memoized cache */
const cache = new Map<string, unknown>()

export const defaultLocale = "en"

function normalizeLocales(locales: Locales): string[] {
  const out = Array.isArray(locales) ? locales : [locales]
  return [...out, defaultLocale]
}

export function date(
  locales: Locales,
  value: string | Date,
  format?: Intl.DateTimeFormatOptions
): string {
  const _locales = normalizeLocales(locales)

  const formatter = getMemoized(
    () => cacheKey("date", _locales, format),
    () => new Intl.DateTimeFormat(_locales, format)
  )

  return formatter.format(isString(value) ? new Date(value) : value)
}

export function number(
  locales: Locales,
  value: number,
  format?: Intl.NumberFormatOptions
): string {
  const _locales = normalizeLocales(locales)

  const formatter = getMemoized(
    () => cacheKey("number", _locales, format),
    () => new Intl.NumberFormat(_locales, format)
  )

  return formatter.format(value)
}
export type PluralOptions = { [key: string]: Intl.LDMLPluralRule } & {
  offset: number
  other: string
}
export function plural(
  locales: Locales,
  ordinal: boolean,
  value: number,
  { offset = 0, ...rules }: PluralOptions
): string {
  const _locales = normalizeLocales(locales)

  const plurals = ordinal
    ? getMemoized(
        () => cacheKey("plural-ordinal", _locales),
        () => new Intl.PluralRules(_locales, { type: "ordinal" })
      )
    : getMemoized(
        () => cacheKey("plural-cardinal", _locales),
        () => new Intl.PluralRules(_locales, { type: "cardinal" })
      )

  return rules[value] ?? rules[plurals.select(value - offset)] ?? rules.other
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
  locales: readonly string[],
  options?: Intl.DateTimeFormatOptions | Intl.NumberFormatOptions
) {
  const localeKey = locales.join("-")
  return `${type}-${localeKey}-${JSON.stringify(options)}`
}

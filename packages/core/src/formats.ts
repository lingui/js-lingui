import { isString } from "./essentials"
import { Locales } from "./i18n"

/** Memoized cache */
const cache = new Map<string, unknown>()

export const defaultLocale = "en"

function normalizeLocales(locales: Locales): string[] {
  const out = Array.isArray(locales) ? locales : [locales]
  return [...out, defaultLocale]
}

export type DateTimeFormatSize = "short" | "default" | "long" | "full"

export function date(
  locales: Locales,
  value: string | Date,
  format?: Intl.DateTimeFormatOptions | DateTimeFormatSize
): string {
  const _locales = normalizeLocales(locales)

  if (!format) {
    format = "default"
  }

  let o: Intl.DateTimeFormatOptions

  if (typeof format === "string") {
    // Implementation is taken from
    // https://github.com/messageformat/messageformat/blob/df2da92bf6541a77aac2ce3cdcd0100bed2b2c5b/mf1/packages/runtime/src/fmt/date.ts
    o = {
      day: "numeric",
      month: "short",
      year: "numeric",
    }

    /* eslint-disable no-fallthrough */
    switch (format) {
      case "full":
        o.weekday = "long"
      case "long":
        o.month = "long"
        break
      case "short":
        o.month = "numeric"
        break
    }
  } else {
    o = format
  }

  const formatter = getMemoized(
    () => cacheKey("date", _locales, format),
    () => new Intl.DateTimeFormat(_locales, o)
  )

  return formatter.format(isString(value) ? new Date(value) : value)
}

export function time(
  locales: Locales,
  value: string | Date,
  format?: Intl.DateTimeFormatOptions | DateTimeFormatSize
): string {
  let o: Intl.DateTimeFormatOptions

  if (!format) {
    format = "default"
  }

  if (typeof format === "string") {
    // https://github.com/messageformat/messageformat/blob/df2da92bf6541a77aac2ce3cdcd0100bed2b2c5b/mf1/packages/runtime/src/fmt/time.ts

    o = {
      second: "numeric",
      minute: "numeric",
      hour: "numeric",
    }

    switch (format) {
      case "full":
      case "long":
        o.timeZoneName = "short"
        break
      case "short":
        delete o.second
    }
  } else {
    o = format
  }

  return date(locales, value, o)
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

function cacheKey(type: string, locales: readonly string[], options?: unknown) {
  const localeKey = locales.join("-")
  return `${type}-${localeKey}-${JSON.stringify(options)}`
}

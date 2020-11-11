import { isString } from "./essentials"
import { Locales } from "./i18n"

/** Memoized cache */
const numberFormats = new Map<string, Intl.NumberFormat>()
const dateFormats = new Map<string, Intl.DateTimeFormat>()

export function date(
  locales: Locales,
  format: Intl.DateTimeFormatOptions = {},
  memoize: boolean = true,
): (value: string | Date) => string {
  return (value) => {
    if (isString(value)) value = new Date(value)
    if (memoize) {
      const key = cacheKey<Intl.DateTimeFormatOptions>(locales, format)
      const cachedFormatter = dateFormats.get(key)
      if (cachedFormatter) {
        return cachedFormatter.format(value)
      }

      const formatter = new Intl.DateTimeFormat(locales, format)
      dateFormats.set(key, formatter)
      return formatter.format(value)
    }

    const formatter = new Intl.DateTimeFormat(locales, format)
    return formatter.format(value)
  }
}

export function number(
  locales: Locales,
  format: Intl.NumberFormatOptions = {},
  memoize: boolean = true,
): (value: number) => string {
  return (value) => {
    if (memoize) {
      const key = cacheKey<Intl.NumberFormatOptions>(locales, format)
      const cachedFormatter = numberFormats.get(key)
      if (cachedFormatter) {
        return cachedFormatter.format(value)
      }

      const formatter = new Intl.NumberFormat(locales, format)
      numberFormats.set(key, formatter)
      return formatter.format(value)
    }

    const formatter = new Intl.NumberFormat(locales, format)
    return formatter.format(value)
  }
}

/** Memoize helpers */
function cacheKey<T>(
  locales?: string | string[],
  options: T = {} as T,
) {
  const localeKey = Array.isArray(locales) ? locales.sort().join('-') : locales
  return `${localeKey}-${JSON.stringify(options)}`
}
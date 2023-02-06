import { CompiledMessage, Formats, LocaleData, Locales, Values } from "./i18n"
import { date, number } from "./formats"
import { isString, isFunction } from "./essentials"

export const UNICODE_REGEX = /\\u[a-fA-F0-9]{4}|\\x[a-fA-F0-9]{2}/g

const defaultFormats = (
  locale: string,
  locales: Locales,
  localeData: LocaleData = { plurals: undefined },
  formats: Formats = {}
) => {
  locales = locales || locale
  const { plurals } = localeData
  const style = <T>(format: string | T): T =>
    isString(format) ? formats[format] || { style: format } : (format as any)
  const replaceOctothorpe = (value: number, message) => {
    return (ctx) => {
      const msg = isFunction(message) ? message(ctx) : message
      const norm = Array.isArray(msg) ? msg : [msg]
      const numberFormat = Object.keys(formats).length ? style("number") : {}
      const valueStr = number(locales, numberFormat)(value)
      return norm.map((m) => (isString(m) ? m.replace("#", valueStr) : m))
    }
  }

  if (!plurals) {
    console.error(
      `Plurals for locale ${locale} aren't loaded. Use i18n.loadLocaleData method to load plurals for specific locale. Using other plural rule as a fallback.`
    )
  }

  return {
    plural: (value: number, { offset = 0, ...rules }) => {
      const message =
        rules[value] || rules[plurals?.(value - offset)] || rules.other

      return replaceOctothorpe(value - offset, message)
    },

    selectordinal: (value: number, { offset = 0, ...rules }) => {
      const message =
        rules[value] || rules[plurals?.(value - offset, true)] || rules.other
      return replaceOctothorpe(value - offset, message)
    },

    select: (value: string, rules) => rules[value] || rules.other,

    number: (value: number, format: string | Intl.NumberFormatOptions) =>
      number(locales, style(format))(value),

    date: (value: string, format: string | Intl.DateTimeFormatOptions) =>
      date(locales, style(format))(value),

    undefined: (value: unknown) => value,
  }
}

// Params -> CTX
/**
 * Creates a context object, which formats ICU MessageFormat arguments based on
 * argument type.
 *
 * @param locale     - Locale of message
 * @param locales      - Locales to be used when formatting the numbers or dates
 * @param values       - Parameters for variable interpolation
 * @param localeData - Locale data (e.g: plurals)
 * @param formats - Custom format styles
 * @returns {function(string, string, any)}
 */
function context(
  locale: string,
  locales: Locales,
  values: Values,
  formats: Formats,
  localeData: LocaleData
) {
  const formatters = defaultFormats(locale, locales, localeData, formats)

  const ctx = (name: string, type: string, format: any): string => {
    const value = values[name]
    const formatted = formatters[type](value, format)
    const message = isFunction(formatted) ? formatted(ctx) : formatted
    return Array.isArray(message) ? message.join("") : message
  }

  return ctx
}

export function interpolate(
  translation: CompiledMessage,
  locale: string,
  locales: Locales,
  localeData: LocaleData
) {
  return (values: Values, formats: Formats = {}): string => {
    const ctx = context(locale, locales, values, formats, localeData)

    const formatMessage = (message: CompiledMessage): string => {
      if (!Array.isArray(message)) return message

      return message.reduce<string>((message, token) => {
        if (isString(token)) return message + token

        const [name, type, format] = token

        let interpolatedFormat = {}
        if (format != null && !isString(format)) {
          Object.keys(format).forEach((key) => {
            interpolatedFormat[key] = formatMessage(format[key])
          })
        } else {
          interpolatedFormat = format
        }

        const value = ctx(name, type, interpolatedFormat)
        if (value == null) return message

        return message + value
      }, "")
    }

    const result = formatMessage(translation)
    if (isString(result) && UNICODE_REGEX.test(result))
      return JSON.parse(`"${result.trim()}"`)
    if (isString(result)) return result.trim()
    return result
  }
}

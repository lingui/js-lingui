import { Locales } from "./i18n"
import { date, number } from "./formats"
import { isString, isFunction } from "./essentials"

const defaultFormats = (
  locale,
  locales,
  localeData = { plurals: undefined },
  formats = {}
) => {
  locales = locales || locale
  const { plurals } = localeData
  const style = (format) =>
    isString(format) ? formats[format] || { style: format } : format
  const replaceOctothorpe = (value, message) => {
    return (ctx) => {
      const msg = isFunction(message) ? message(ctx) : message
      const norm = Array.isArray(msg) ? msg : [msg]
      const formatter = new Intl.NumberFormat(locales)
      const valueStr = formatter.format(value)
      return norm.map((m) => (isString(m) ? m.replace("#", valueStr) : m))
    }
  }

  return {
    plural: (value, { offset = 0, ...rules }) => {
      if (!isFunction(plurals)) return null;
      const message = rules[value] || rules[plurals(value - offset)]
      return replaceOctothorpe(value - offset, message)
    },

    selectordinal: (value, { offset = 0, ...rules }) => {
      if (!isFunction(plurals)) return null;
      const message = rules[value] || rules[plurals(value - offset, true)]
      return replaceOctothorpe(value - offset, message)
    },

    select: (value, rules) => rules[value] || rules.other,

    number: (value, format) => number(locales, style(format))(value),

    date: (value, format) => date(locales, style(format))(value),

    undefined: (value) => value,
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
function context({ locale, locales, values, formats, localeData }) {
  const formatters = defaultFormats(locale, locales, localeData, formats)

  const ctx = (name: string, type: string, format: any) => {
    if (!formatters.hasOwnProperty(type)) return null

    const value = values[name]
    const formatted = formatters[type](value, format)
    const message = isFunction(formatted) ? formatted(ctx) : formatted
    return Array.isArray(message) ? message.join("") : message
  }

  return ctx
}

export function interpolate(
  translation: string | Array<string | [string, string?, Object?]>,
  locale: string,
  locales: Locales,
  localeData: Object
) {
  return (values: Object, formats: Object = {}) => {
    const ctx = context({
      locale,
      locales,
      localeData,
      formats,
      values,
    })

    const formatMessage = (message) => {
      if (!Array.isArray(message)) return message

      return message.reduce((message, token) => {
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
    return result.trim()
  }
}

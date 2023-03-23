import { CompiledMessage, Formats, Locales, Values } from "./i18n"
import { date, number, plural } from "./formats"
import { isString } from "./essentials"

export const UNICODE_REGEX = /\\u[a-fA-F0-9]{4}|\\x[a-fA-F0-9]{2}/g

const getDefaultFormats = (
  locale: string,
  locales: Locales,
  formats: Formats = {}
) => {
  locales = locales || locale
  const style = <T>(format: string | T): T =>
    isString(format) ? formats[format] || { style: format } : (format as any)

  const replaceOctothorpe = (value: number, message: string): string => {
    const numberFormat = Object.keys(formats).length ? style("number") : {}
    const valueStr = number(locales, value, numberFormat)
    return message.replace("#", valueStr)
  }

  return {
    plural: (value: number, cases) => {
      const { offset = 0 } = cases
      const message = plural(locales, false, value, cases)

      return replaceOctothorpe(value - offset, message)
    },

    selectordinal: (value: number, cases) => {
      const { offset = 0 } = cases
      const message = plural(locales, true, value, cases)

      return replaceOctothorpe(value - offset, message)
    },

    select: (value: string, rules) => rules[value] || rules.other,

    number: (
      value: number,
      format: string | Intl.NumberFormatOptions
    ): string => number(locales, value, style(format)),

    date: (
      value: string,
      format: string | Intl.DateTimeFormatOptions
    ): string => date(locales, value, style(format)),

    undefined: (value: unknown) => value,
  }
}

/**
 * @param translation compiled message
 * @param locale Locale of message
 * @param locales Locales to be used when formatting the numbers or dates
 */
export function interpolate(
  translation: CompiledMessage,
  locale: string,
  locales: Locales
) {
  /**
   * @param values  - Parameters for variable interpolation
   * @param formats - Custom format styles
   */
  return (values: Values, formats: Formats = {}): string => {
    const formatters = getDefaultFormats(locale, locales, formats)

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

        const value = formatters[type](values[name], interpolatedFormat)
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

import { CompiledMessage, Formats, Locales, Values } from "./i18n"
import { date, number, plural, type PluralOptions } from "./formats"
import { isString } from "./essentials"
import unraw from "unraw"

export const UNICODE_REGEX = /\\u[a-fA-F0-9]{4}|\\x[a-fA-F0-9]{2}/g

const getDefaultFormats = (
  locale: string,
  passedLocales?: Locales,
  formats: Formats = {}
) => {
  const locales = passedLocales || locale

  const style = <T extends object>(format: string | T): T => {
    return typeof format === "object"
      ? (format as any)
      : formats[format] || { style: format }
  }
  const replaceOctothorpe = (value: number, message: string): string => {
    const numberFormat = Object.keys(formats).length
      ? style("number")
      : undefined
    const valueStr = number(locales, value, numberFormat)
    return message.replace("#", valueStr)
  }

  return {
    plural: (value: number, cases: PluralOptions) => {
      const { offset = 0 } = cases
      const message = plural(locales, false, value, cases)

      return replaceOctothorpe(value - offset, message)
    },

    selectordinal: (value: number, cases: PluralOptions) => {
      const { offset = 0 } = cases
      const message = plural(locales, true, value, cases)

      return replaceOctothorpe(value - offset, message)
    },

    select: selectFormatter,

    number: (
      value: number,
      format: string | Intl.NumberFormatOptions
    ): string => number(locales, value, style(format)),

    date: (
      value: string,
      format: string | Intl.DateTimeFormatOptions
    ): string => date(locales, value, style(format)),

    undefined: undefinedFormatter,
  } as const
}

const selectFormatter = (value: string, rules: Record<string, any>) =>
  rules[value] ?? rules.other

const undefinedFormatter = (value: unknown) => value

/**
 * @param translation compiled message
 * @param locale Locale of message
 * @param locales Locales to be used when formatting the numbers or dates
 */
export function interpolate(
  translation: CompiledMessage,
  locale: string,
  locales?: Locales
) {
  /**
   * @param values  - Parameters for variable interpolation
   * @param formats - Custom format styles
   */
  return (values: Values = {}, formats?: Formats): string => {
    const formatters = getDefaultFormats(locale, locales, formats)

    const formatMessage = (message: CompiledMessage | number | undefined) => {
      if (!Array.isArray(message)) return message

      return message.reduce<string>((message, token) => {
        if (isString(token)) return message + token

        const [name, type, format] = token

        let interpolatedFormat: any = {}
        if (format != null && typeof format === "object") {
          Object.entries(format).forEach(([key, value]) => {
            interpolatedFormat[key] = formatMessage(value)
          })
        } else {
          interpolatedFormat = format
        }
        // @ts-ignore TS2538: Type undefined cannot be used as an index type.
        const formatter = formatters[type]
        const value = formatter(values[name], interpolatedFormat)
        if (value == null) return message

        return message + value
      }, "")
    }

    const result = formatMessage(translation)
    if (isString(result) && UNICODE_REGEX.test(result)) {
      // convert raw unicode sequences back to normal strings
      // note JSON.parse hack is not working as you might expect https://stackoverflow.com/a/57560631/2210610
      // that's why special library for that purpose is used
      return unraw(result.trim())
    }
    if (isString(result)) return result.trim()
    return result ? String(result) : ""
  }
}

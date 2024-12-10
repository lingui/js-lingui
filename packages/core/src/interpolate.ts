import { CompiledMessage, Formats, Locales, Values } from "./i18n"
import {
  date,
  DateTimeFormatSize,
  number,
  plural,
  type PluralOptions,
  time,
} from "./formats"
import { isString } from "./essentials"
import { unraw } from "unraw"
import { CompiledIcuChoices } from "@lingui/message-utils/compileMessage"

export const UNICODE_REGEX = /\\u[a-fA-F0-9]{4}|\\x[a-fA-F0-9]{2}/

const OCTOTHORPE_PH = "%__lingui_octothorpe__%"

const getDefaultFormats = (
  locale: string,
  passedLocales?: Locales,
  formats: Formats = {}
) => {
  const locales = passedLocales || locale

  const style = <T extends object>(format: string | T): T => {
    if (typeof format === "object") return format as T
    return formats[format] as T
  }

  const replaceOctothorpe = (value: number, message: string): string => {
    const numberFormat = Object.keys(formats).length
      ? style("number")
      : undefined
    const valueStr = number(locales, value, numberFormat)
    return message.replace(new RegExp(OCTOTHORPE_PH, "g"), valueStr)
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
    ): string =>
      number(
        locales,
        value,
        style(format) || ({ style: format } as Intl.NumberFormatOptions)
      ),

    date: (
      value: string,
      format: Intl.DateTimeFormatOptions | string
    ): string =>
      date(locales, value, style(format) || (format as DateTimeFormatSize)),
    time: (value: string, format: string): string =>
      time(locales, value, style(format) || (format as DateTimeFormatSize)),
  } as const
}

const selectFormatter = (value: string, rules: Record<string, any>) =>
  rules[value] ?? rules.other

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

    const formatMessage = (
      tokens: CompiledMessage | number | undefined,
      replaceOctothorpe: boolean = false
    ) => {
      if (!Array.isArray(tokens)) return tokens

      return tokens.reduce<string>((message, token) => {
        if (token === "#" && replaceOctothorpe) {
          return message + OCTOTHORPE_PH
        }

        if (isString(token)) {
          return message + token
        }

        const [name, type, format] = token

        let interpolatedFormat: any = {}

        if (
          type === "plural" ||
          type === "selectordinal" ||
          type === "select"
        ) {
          Object.entries(format as CompiledIcuChoices).forEach(
            ([key, value]) => {
              interpolatedFormat[key] = formatMessage(
                value,
                type === "plural" || type === "selectordinal"
              )
            }
          )
        } else {
          interpolatedFormat = format
        }

        let value: unknown

        if (type) {
          // run formatter, such as plural, number, etc.
          const formatter = (formatters as any)[type]
          value = formatter(values[name], interpolatedFormat)
        } else {
          // simple placeholder variable interpolation eq {variableName}
          value = values[name]
        }

        if (value == null) {
          return message
        }

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

import {
  CompiledMessage,
  Formats,
  Formatters,
  Locales,
  Values,
  Variables,
} from "./i18n"
import {
  date,
  DateTimeFormatSize,
  type DateTimeFormatValue,
  number,
  type NumberFormatValue,
  plural,
  type PluralOptions,
  time,
} from "./formats"
import { isString, isFunction } from "./essentials"
import { CompiledIcuChoices } from "@lingui/message-utils/compileMessage"
import { decodeEscapeSequences, ESCAPE_SEQUENCE_REGEX } from "./escapeSequences"

const OCTOTHORPE_PH = "%__lingui_octothorpe__%"

/**
 * Names handled by `getDefaultFormats`, which can't be used for custom formatters
 */
export const BUILT_IN_FORMATTERS: readonly string[] = [
  "plural",
  "selectordinal",
  "select",
  "number",
  "date",
  "time",
]

const hasOwn = (obj: object, key: string) =>
  Object.prototype.hasOwnProperty.call(obj, key)

const getDefaultFormats = (
  locale: string,
  passedLocales?: Locales,
  formats: Formats = {},
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
      value: NumberFormatValue,
      format: string | Intl.NumberFormatOptions,
    ): string =>
      number(
        locales,
        value,
        style(format) || ({ style: format } as Intl.NumberFormatOptions),
      ),

    date: (
      value: string | DateTimeFormatValue,
      format: Intl.DateTimeFormatOptions | string,
    ): string =>
      date(locales, value, style(format) || (format as DateTimeFormatSize)),
    time: (value: string | DateTimeFormatValue, format: string): string =>
      time(locales, value, style(format) || (format as DateTimeFormatSize)),
  } as const
}

const selectFormatter = (value: string, rules: Record<string, any>) =>
  // Own-property check so a runtime value like "constructor" or "toString"
  // falls back to the `other` branch instead of resolving to a member
  // inherited from Object.prototype.
  (Object.prototype.hasOwnProperty.call(rules, value)
    ? rules[value]
    : undefined) ?? rules.other

/**
 * @param translation compiled message
 * @param locale Locale of message
 * @param locales Locales to be used when formatting the numbers or dates
 * @param customFormatters Custom formatters configured in the i18n instance
 */
export function interpolate(
  translation: CompiledMessage,
  locale: string,
  locales?: Locales,
  customFormatters: Formatters = {},
) {
  /**
   * @param values    - Parameters for variable interpolation
   * @param formats   - Custom format styles
   * @param variables - Default variables configured in the i18n instance
   */
  return (
    values: Values = {},
    formats?: Formats,
    variables?: Variables,
  ): string => {
    const formatters = getDefaultFormats(locale, locales, formats)

    const getValue = (name: string): unknown => {
      // Only lazily invoke functions from default variables, not per-call values
      const variable = variables?.[name]
      return values[name] ?? (isFunction(variable) ? variable() : variable)
    }

    const formatMessage = (
      tokens: CompiledMessage | number | undefined,
      replaceOctothorpe: boolean = false,
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
                type === "plural" || type === "selectordinal",
              )
            },
          )
        } else {
          interpolatedFormat = format
        }

        let value: unknown

        if (!type) {
          // simple placeholder variable interpolation eq {variableName}
          value = getValue(name)
        } else if (hasOwn(formatters, type)) {
          // run built-in formatter, such as plural, number, etc.
          const formatter = (formatters as any)[type]
          value = formatter(getValue(name), interpolatedFormat)
        } else if (hasOwn(customFormatters, type)) {
          value = customFormatters[type]!(getValue(name), {
            locale,
            locales,
            param: format as string | undefined,
          })
        } else {
          if (process.env.NODE_ENV !== "production") {
            console.warn(
              `Lingui: Unknown formatter "${type}" used in "{${name}, ${type}}". ` +
                `The value is rendered without formatting. ` +
                `Register custom formatters with \`setupI18n({ formatters })\`.`,
            )
          }
          value = getValue(name)
        }

        if (value == null) {
          return message
        }

        return message + value
      }, "")
    }

    const result = formatMessage(translation)
    if (isString(result) && ESCAPE_SEQUENCE_REGEX.test(result)) {
      return decodeEscapeSequences(result)
    }
    if (isString(result)) return result
    return result ? String(result) : ""
  }
}

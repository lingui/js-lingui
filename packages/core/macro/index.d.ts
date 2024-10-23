import type { I18n, MessageDescriptor } from "@lingui/core"

export type ChoiceOptions = {
  /** Offset of value when calculating plural forms */
  offset?: number
  zero?: string
  one?: string
  two?: string
  few?: string
  many?: string

  /** Catch-all option */
  other: string
  /** Exact match form, corresponds to =N rule */
  [digit: `${number}`]: string
}

type MacroMessageDescriptor = (
  | {
      id: string
      message?: string
    }
  | {
      id?: string
      message: string
    }
) & {
  comment?: string
  context?: string
}

/**
 * Translates a message descriptor
 *
 * @example
 * ```
 * import { t } from "@lingui/core/macro";
 * const message = t({
 *   id: "msg.hello",
 *   comment: "Greetings at the homepage",
 *   message: `Hello ${name}`,
 * });
 * ```
 *
 * @example
 * ```
 * import { t } from "@lingui/core/macro";
 * const message = t({
 *   id: "msg.plural",
 *   message: plural(value, { one: "...", other: "..." }),
 * });
 * ```
 *
 * @param descriptor The message descriptor to translate
 */
export function t(descriptor: MacroMessageDescriptor): string

/**
 * Translates a template string using the global I18n instance
 *
 * @example
 * ```
 * import { t } from "@lingui/core/macro";
 * const message = t`Hello ${name}`;
 * ```
 */
export function t(
  literals: TemplateStringsArray,
  ...placeholders: any[]
): string

/**
 * Translates a template string or message descriptor using a given I18n instance
 *
 * @example
 * ```
 * import { t } from "@lingui/core/macro";
 * import { I18n } from "@lingui/core";
 * const i18n = new I18n({
 *   locale: "nl",
 *   messages: { "Hello {name}": "Hallo {name}" },
 * });
 * const message = t(i18n)`Hello ${name}`;
 * ```
 *
 * @example
 * ```
 * import { t } from "@lingui/core/macro";
 * import { I18n } from "@lingui/core";
 * const i18n = new I18n({
 *   locale: "nl",
 *   messages: { "Hello {name}": "Hallo {name}" },
 * });
 * const message = t(i18n)({ message: `Hello ${name}` });
 * ```
 *
 * @deprecated in v5, would be removed in v6.
 * Please use `` i18n._(msg`Hello ${name}`) `` instead
 *
 */
export function t(i18n: I18n): {
  (literals: TemplateStringsArray, ...placeholders: any[]): string
  (descriptor: MacroMessageDescriptor): string
}

/**
 * Pluralize a message
 *
 * @example
 * ```
 * import { plural } from "@lingui/core/macro";
 * const message = plural(count, {
 *   one: "# Book",
 *   other: "# Books",
 * });
 * ```
 *
 * @param value Determines the plural form
 * @param options Object with available plural forms
 */
export function plural(value: number | string, options: ChoiceOptions): string

/**
 * Pluralize a message using ordinal forms
 *
 * Similar to `plural` but instead of using cardinal plural forms,
 * it uses ordinal forms.
 *
 * @example
 * ```
 * import { selectOrdinal } from "@lingui/core/macro";
 * const message = selectOrdinal(count, {
 *    one: "#st",
 *    two: "#nd",
 *    few: "#rd",
 *    other: "#th",
 * });
 * ```
 *
 * @param value Determines the plural form
 * @param options Object with available plural forms
 */
export function selectOrdinal(
  value: number | string,
  options: ChoiceOptions
): string

type SelectOptions = {
  /** Catch-all option */
  other: string
  [matches: string]: string
}

/**
 * Selects a translation based on a value
 *
 * Select works like a switch statement. It will
 * select one of the forms in `options` object which
 * key matches exactly `value`.
 *
 * @example
 * ```
 * import { select } from "@lingui/core/macro";
 * const message = select(gender, {
 *    male: "he",
 *    female: "she",
 *    other: "they",
 * });
 * ```
 *
 * @param value The key of choices to use
 * @param choices
 */
export function select(value: string, choices: SelectOptions): string

/**
 * Define a message for later use
 *
 * `defineMessage` can be used to add comments for translators,
 * or to override the message ID.
 *
 * @example
 * ```
 * import { defineMessage } from "@lingui/core/macro";
 * const message = defineMessage({
 *    comment: "Greetings on the welcome page",
 *    message: `Welcome, ${name}!`,
 * });
 * ```
 *
 * @param descriptor The message descriptor
 */
export function defineMessage(
  descriptor: MacroMessageDescriptor
): MessageDescriptor

/**
 * Define a message for later use
 *
 * @example
 * ```
 * import { defineMessage, msg } from "@lingui/core/macro";
 * const message = defineMessage`Hello ${name}`;
 *
 * // or using shorter version
 * const message = msg`Hello ${name}`;
 * ```
 */
export function defineMessage(
  literals: TemplateStringsArray,
  ...placeholders: any[]
): MessageDescriptor

/**
 * Define a message for later use
 * Alias for {@link defineMessage}
 */
export const msg: typeof defineMessage

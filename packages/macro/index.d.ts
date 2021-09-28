import type { ReactElement, ComponentType, ReactNode } from "react"
import type { MessageDescriptor, I18n } from "@lingui/core"
import type { TransRenderProps } from "@lingui/react"

export type UnderscoreDigit<T = string> = { [digit: string]: T }
export type ChoiceOptions<T = string> = {
  offset?: number
  zero?: T
  one?: T
  few?: T
  many?: T
  other?: T
} & UnderscoreDigit<T>

/**
 * Translates a message descriptor
 *
 * @example
 * ```
 * import { t } from "@lingui/macro";
 * const message = t({
 *   id: "msg.hello",
 *   comment: "Greetings at the homepage",
 *   message: `Hello ${name}`,
 * });
 * ```
 *
 * @example
 * ```
 * import { t } from "@lingui/macro";
 * const message = t({
 *   id: "msg.plural",
 *   message: plural(value, { one: "...", other: "..." }),
 * });
 * ```
 *
 * @param messageDescriptior The descriptor to translate
 */
export function t(messageDescriptior: MessageDescriptor): string

/**
 * Translates a template string using the global I18n instance
 *
 * @example
 * ```
 * import { t } from "@lingui/macro";
 * const message = t`Hello ${name}`;
 * ```
 */
export function t(
  literals: TemplateStringsArray,
  ...placeholders: any[]
): string

/**
 * Translates a template string using a given I18n instance
 *
 * @example
 * ```
 * import { t } from "@lingui/macro";
 * import { I18n } from "@lingui/core";
 * const i18n = new I18n({
 *   locale: "nl",
 *   messages: { "Hello {0}": "Hallo {0}" },
 * });
 * const message = t(i18n)`Hello ${name}`;
 * ```
 */
export function t(
  i18n: I18n,
  literals: TemplateStringsArray,
  ...placeholders: any[]
): string

/**
 * Pluralize a message
 *
 * @example
 * ```
 * import { plural } from "@lingui/macro";
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
 * import { selectOrdinal } from "@lingui/macro";
 * const message = selectOrdinal(count, {
 *    one: "1st",
 *    two: "2nd",
 *    few: "3rd",
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

/**
 * Selects a translation based on a value
 *
 * Select works like a switch statement. It will
 * select one of the forms in `options` object which
 * key matches exactly `value`.
 *
 * @example
 * ```
 * import { select } from "@lingui/macro";
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
export function select(value: string, choices: ChoiceOptions): string

/**
 * Defines multiple messages for extraction
 *
 * @see {@link defineMessage} for more details
 */
export function defineMessages<M extends Record<string, MessageDescriptor>>(
  messages: M
): M

/**
 * Define a message for later use
 *
 * `defineMessage` can be used to add comments for translators,
 * or to override the message ID.
 *
 * @example
 * ```
 * import { defineMessage } from "@lingui/macro";
 * const message = defineMessage({
 *    comment: "Greetings on the welcome page",
 *    message: `Welcome, ${name}!`,
 * });
 * ```
 *
 * @param descriptor The message descriptor
 */
export function defineMessage(descriptor: MessageDescriptor): MessageDescriptor

export type TransProps = {
  id?: string
  comment?: string
  values?: Record<string, unknown>
  component?: React.ComponentType<TransRenderProps>
  render?: (props: TransRenderProps) => ReactElement<any, any> | null
}

export type ChoiceProps = {
  value?: string | number
} & TransProps &
  ChoiceOptions<ReactNode>

/**
 * The types should be changed after this PR is merged
 * https://github.com/Microsoft/TypeScript/pull/26797
 *
 * then we should be able to specify that key of values is same type as value.
 * We would be able to remove separate type Values = {...} definition
 * eg.
 * type SelectProps<Values> = {
 *  value?: Values
 *  [key: Values]: string
 * }
 *
 */
type Values = { [key: string]: string }

export type SelectProps = {
  value: string
  other: ReactNode
} & TransProps &
  Values

export const Trans: ComponentType<TransProps>
export const Plural: ComponentType<ChoiceProps>
export const Select: ComponentType<SelectProps>
export const SelectOrdinal: ComponentType<ChoiceProps>

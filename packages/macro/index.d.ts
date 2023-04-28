// eslint-disable-next-line import/no-extraneous-dependencies
import type { ReactNode, VFC, FC } from "react"
import type { I18n, MessageDescriptor } from "@lingui/core"
import type { TransRenderCallbackOrComponent } from "@lingui/react"

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
 * @param descriptor The message descriptor to translate
 */
export function t(descriptor: MacroMessageDescriptor): string

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
 * Translates a template string or message descriptor using a given I18n instance
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
 *
 * @example
 * ```
 * import { t } from "@lingui/macro";
 * import { I18n } from "@lingui/core";
 * const i18n = new I18n({
 *   locale: "nl",
 *   messages: { "Hello {0}": "Hallo {0}" },
 * });
 * const message = t(i18n)({ message: `Hello ${name}` });
 * ```
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
export function select(value: string, choices: SelectOptions): string

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
export function defineMessage(
  descriptor: MacroMessageDescriptor
): MessageDescriptor

/**
 * Define a message for later use
 *
 * @example
 * ```
 * import { defineMessage, msg } from "@lingui/macro";
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
 * Alias for {@see defineMessage}
 */
export const msg: typeof defineMessage

type CommonProps = TransRenderCallbackOrComponent & {
  id?: string
  comment?: string
  context?: string
}

type TransProps = {
  children: ReactNode
} & CommonProps

type PluralChoiceProps = {
  value: string | number
  /** Offset of value when calculating plural forms */
  offset?: number
  zero?: ReactNode
  one?: ReactNode
  two?: ReactNode
  few?: ReactNode
  many?: ReactNode

  /** Catch-all option */
  other: ReactNode
  /** Exact match form, corresponds to =N rule */
  [digit: `_${number}`]: ReactNode
} & CommonProps

type SelectChoiceProps = {
  value: string
  /** Catch-all option */
  other: ReactNode
  [option: `_${string}`]: ReactNode
} & CommonProps

/**
 * Trans is the basic macro for static messages,
 * messages with variables, but also for messages with inline markup
 *
 * @example
 * ```
 * <Trans>Hello {username}. Read the <a href="/docs">docs</a>.</Trans>
 * ```
 * @example
 * ```
 * <Trans id="custom.id">Hello {username}.</Trans>
 * ```
 */
export const Trans: FC<TransProps>

/**
 * Props of Plural macro are transformed into plural format.
 *
 * @example
 * ```
 * import { Plural } from "@lingui/macro"
 * <Plural value={numBooks} one="Book" other="Books" />
 *
 * // ↓ ↓ ↓ ↓ ↓ ↓
 * import { Trans } from "@lingui/react"
 * <Trans id="{numBooks, plural, one {Book} other {Books}}" values={{ numBooks }} />
 * ```
 */
export const Plural: VFC<PluralChoiceProps>
/**
 * Props of SelectOrdinal macro are transformed into selectOrdinal format.
 *
 * @example
 * ```
 * // count == 1 -> 1st
 * // count == 2 -> 2nd
 * // count == 3 -> 3rd
 * // count == 4 -> 4th
 * <SelectOrdinal
 *     value={count}
 *     one="#st"
 *     two="#nd"
 *     few="#rd"
 *     other="#th"
 * />
 * ```
 */
export const SelectOrdinal: VFC<PluralChoiceProps>

/**
 * Props of Select macro are transformed into select format
 *
 * @example
 * ```
 * // gender == "female"      -> Her book
 * // gender == "male"        -> His book
 * // gender == "non-binary"  -> Their book
 *
 * <Select
 *     value={gender}
 *     _male="His book"
 *     _female="Her book"
 *     other="Their book"
 * />
 * ```
 */
export const Select: VFC<SelectChoiceProps>

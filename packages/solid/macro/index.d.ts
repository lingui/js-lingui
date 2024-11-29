import { Component, JSX, ParentComponent } from 'solid-js'
import type { TransRenderCallbackOrComponent, I18nContext } from "@lingui/solid"
import type { MacroMessageDescriptor } from "@lingui/core/macro"

type CommonProps = TransRenderCallbackOrComponent & {
  id?: string
  comment?: string
  context?: string
}

type TransProps = {
  children: JSX.Element
} & CommonProps

type PluralChoiceProps = {
  value: string | number
  /** Offset of value when calculating plural forms */
  offset?: number
  zero?: JSX.Element
  one?: JSX.Element
  two?: JSX.Element
  few?: JSX.Element
  many?: JSX.Element

  /** Catch-all option */
  other: JSX.Element
  /** Exact match form, corresponds to =N rule */
  [digit: `_${number}`]: JSX.Element
} & CommonProps

type SelectChoiceProps = {
  value: string
  /** Catch-all option */
  other: JSX.Element
  [option: `_${string}`]: JSX.Element
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
export const Trans: ParentComponent<TransProps>

/**
 * Props of Plural macro are transformed into plural format.
 *
 * @example
 * ```
 * import { Plural } from "@lingui/core/macro"
 * <Plural value={numBooks} one="Book" other="Books" />
 *
 * // ↓ ↓ ↓ ↓ ↓ ↓
 * import { Trans } from "@lingui/solid"
 * <Trans id="{numBooks, plural, one {Book} other {Books}}" values={{ numBooks }} />
 * ```
 */
export const Plural: Component<PluralChoiceProps>
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
export const SelectOrdinal: Component<PluralChoiceProps>

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
export const Select: Component<SelectChoiceProps>

declare function _t(descriptor: MacroMessageDescriptor): string
declare function _t(
  literals: TemplateStringsArray,
  ...placeholders: any[]
): string

/**
 *
 * Macro version of useLingui replaces _ function with `t` macro function which is bound to i18n passed from context
 *
 * Returned `t` macro function has all the same signatures as global `t`
 *
 * @example
 * ```
 * const { t } = useLingui();
 * const message = t`Text`;
 * ```
 *
 * @example
 * ```
 * const { i18n, t } = useLingui();
 * const locale = i18n.locale;
 * const message = t({
 *   id: "msg.hello",
 *   comment: "Greetings at the homepage",
 *   message: `Hello ${name}`,
 * });
 * ```
 */
export function useLingui(): Omit<I18nContext, "_"> & {
  t: typeof _t
}

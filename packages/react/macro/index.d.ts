import type { ReactNode, VFC, FC } from "react"
import type { TransRenderCallbackOrComponent, I18nContext } from "@lingui/react"
import type { MacroMessageDescriptor } from "@lingui/core/macro"

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
 * import { Plural } from "@lingui/core/macro"
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

export function _t(descriptor: MacroMessageDescriptor): string
export function _t(
  literals: TemplateStringsArray,
  ...placeholders: any[]
): string

/**
 *
 * Macro version of useLingui replaces _ function with `t` macro function which is bound to i18n passed from React.Context
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

import type { VNode, VNodeChild } from "vue"
import type { TransRenderCallbackOrComponent, I18nContext } from "@lingui/vue"
import type {
  MacroMessageDescriptor,
  LabeledExpression,
} from "@lingui/core/macro"

type CommonProps = TransRenderCallbackOrComponent & {
  id?: string
  comment?: string
  context?: string
}

type TransChildren = VNodeChild | LabeledExpression<string | number>
type TransProps = {
  children?: TransChildren | TransChildren[]
} & CommonProps

type PluralChoiceProps = {
  value: string | number | LabeledExpression<string | number>
  /** Offset of value when calculating plural forms */
  offset?: number
  zero?: VNodeChild
  one?: VNodeChild
  two?: VNodeChild
  few?: VNodeChild
  many?: VNodeChild
  other?: VNodeChild
  /** Exact match form, corresponds to =N rule */
  [digit: `_${number}`]: VNodeChild
} & CommonProps

type SelectChoiceProps = {
  value: string | LabeledExpression<string | number>
  other?: VNodeChild
  [option: `_${string}`]: VNodeChild
} & CommonProps

/**
 * Trans is the basic macro for static messages,
 * messages with variables, but also for messages with inline markup
 *
 * Works in JSX/TSX and in `<template>` blocks of single-file components
 * (the template compiler from `@lingui/vue/compiler` handles the latter).
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
export const Trans: (props: TransProps) => VNode

/**
 * Props of Plural macro are transformed into plural format.
 *
 * @example
 * ```
 * import { Plural } from "@lingui/vue/macro"
 * <Plural value={numBooks} one="Book" other="Books" />
 *
 * // ↓ ↓ ↓ ↓ ↓ ↓
 * import { Trans } from "@lingui/vue"
 * <Trans id="{numBooks, plural, one {Book} other {Books}}" values={{ numBooks }} />
 * ```
 */
export const Plural: (props: PluralChoiceProps) => VNode
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
export const SelectOrdinal: (props: PluralChoiceProps) => VNode

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
export const Select: (props: SelectChoiceProps) => VNode

/**
 *
 * Macro version of useLingui replaces `_` function with `t` macro function which is bound to i18n provided by `I18nProvider`
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
 * const locale = i18n.value.locale;
 * const message = t({
 *   id: "msg.hello",
 *   comment: "Greetings at the homepage",
 *   message: `Hello ${name}`,
 * });
 * ```
 */
export function useLingui(): Omit<I18nContext, "_" | "t"> & {
  t: {
    (descriptor: MacroMessageDescriptor): string
    (literals: TemplateStringsArray, ...placeholders: any[]): string
  }
}

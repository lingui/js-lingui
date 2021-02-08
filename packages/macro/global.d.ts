declare module '@lingui/macro' {
  import type { MessageDescriptor } from "@lingui/core"

  export type BasicType = {
    id?: string
    comment?: string
  }

  export function t(
    literals: TemplateStringsArray | MessageDescriptor,
    ...placeholders: any[]
  ): string

  export type UnderscoreDigit<T = string> = { [digit: string]: T }
  export type ChoiceOptions<T = string> = {
    offset?: number
    zero?: T
    one?: T
    few?: T
    many?: T
    other?: T
  } & UnderscoreDigit<T>

  export function plural(arg: number | string, options: ChoiceOptions & BasicType): string
  export function selectOrdinal(
    arg: number | string,
    options: ChoiceOptions & BasicType
  ): string
  export function select(arg: string, choices: Record<string, string> & BasicType): string
  export function defineMessages<M extends Record<string, MessageDescriptor>>(
    messages: M
  ): M
  export function defineMessage(descriptor: MessageDescriptor): MessageDescriptor

  export type ChoiceProps = {
    value?: string | number
  }  & ChoiceOptions<string>

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
    other: any
  } & Values

  export const Trans: any
  export const Plural: any
  export const Select: any
  export const SelectOrdinal: any
}
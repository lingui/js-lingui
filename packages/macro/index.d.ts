import type { ReactElement, ComponentType, ReactNode } from "react"
import type { MessageDescriptor } from "@lingui/core"
import type { TransRenderProps } from "@lingui/react"

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

export function plural(arg: number | string, options: ChoiceOptions): string
export function selectOrdinal(
  arg: number | string,
  options: ChoiceOptions
): string
export function select(arg: string, choices: Record<string, string>): string
export function defineMessages<M extends Record<string, MessageDescriptor>>(
  messages: M
): M
export function defineMessage(descriptor: MessageDescriptor): MessageDescriptor

export type TransProps = {
  id?: string
  comment?: string
  component?: ReactElement<any, any> | null
  render?: (props: TransRenderProps) => ReactElement<any, any> | null
}

export type ChoiceProps = {
  value?: string | number
} & TransProps &
  ChoiceOptions<ReactNode>

export type SelectProps = {
  value?: string
  other?: ReactNode
} & TransProps

export const Trans: ComponentType<TransProps>
export const Plural: ComponentType<ChoiceProps>
export const Select: ComponentType<SelectProps>
export const SelectOrdinal: ComponentType<ChoiceProps>

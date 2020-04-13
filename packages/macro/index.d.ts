import { ComponentType, ReactNode } from "react"
import { MessageDescriptor } from "@lingui/core"
import { TransRenderType } from "@lingui/react"

export function t(
  literals: TemplateStringsArray,
  ...placeholders: any[]
): string

export interface ChoiceOptions<T = string> {
  offset?: number
  zero?: T
  one?: T
  few?: T
  many?: T
  other?: T
}
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

export interface TransProps {
  id?: string
  comment?: string
  render?: TransRenderType
}

export interface ChoiceProps extends TransProps, ChoiceOptions<ReactNode> {
  value?: string | number
}

export interface SelectProps extends TransProps {
  value?: string
  other?: ReactNode
}

export const Trans: ComponentType<TransProps>
export const Plural: ComponentType<ChoiceProps>
export const Select: ComponentType<SelectProps>
export const SelectOrdinal: ComponentType<ChoiceProps>

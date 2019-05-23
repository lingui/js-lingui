import { ComponentType, ReactNode } from "react"
import { MessageDescriptor } from "@lingui/core"
import { TransRenderType } from "@lingui/react"

declare namespace LinguiMacro {
  export function t(
    literals: TemplateStringsArray,
    ...placeholders: any[]
  ): string
  export function plural(arg: number | string, options: Object): string
  export function selectOrdinal(arg: number | string, options: Object): string
  export function select(
    arg: string,
    choices: { [key: string]: string }
  ): string
  export function defineMessages<
    M extends { [key: string]: MessageDescriptor }
  >(messages: M): M
  export function defineMessage(
    descriptor: MessageDescriptor
  ): MessageDescriptor

  export interface TransProps {
    id?: string
    comment?: string
    render?: TransRenderType
  }

  export interface ChoiceProps extends TransProps {
    value?: string | number
    offset?: number
    zero: ReactNode
    one: ReactNode
    few: ReactNode
    many: ReactNode
    other: ReactNode
  }

  export interface SelectProps extends TransProps {
    value?: string
    other?: ReactNode
  }

  export const Trans: ComponentType<TransProps>
  export const Plural: ComponentType<ChoiceProps>
  export const Select: ComponentType<SelectProps>
  export const SelectOrdinal: ComponentType<ChoiceProps>
}

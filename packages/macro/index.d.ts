declare module "@lingui/macro" {
  import { MessageDescriptor } from "@lingui/core"

  function t(literals: TemplateStringsArray, ...placeholders: any[]): string
  function plural(arg: number | string, options): string
  function selectOrdinal(arg: number | string, options): string
  function select(arg: string, choices: { [key: string]: string }): string
  function defineMessages(messages: {[key: string]: MessageDescriptor}): MessageDescriptor
  function defineMessage(descriptor: MessageDescriptor): MessageDescriptor

  export const Trans
  export const Plural
  export const Select
  export const SelectOrdinal
  export const DateFormat
  export const NumberFormat
}

declare module "@lingui/macro" {
  function t(literals: TemplateStringsArray, ...placeholders: any[]): string
  function plural(arg: string, options): string
  function selectOrdinal(arg: string, options): string
  function select(arg: string, choices: { [key: string]: string }): string
  function defineMessages(messages: Object): Object

  export const Trans
  export const Plural
  export const Select
  export const SelectOrdinal
  export const DateFormat
  export const NumberFormat
}

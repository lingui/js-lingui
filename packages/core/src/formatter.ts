export type Formats = Record<
  string,
  Intl.DateTimeFormatOptions | Intl.NumberFormatOptions
>
export type PluralFormatterOptions = { [key: string]: Intl.LDMLPluralRule } & {
  offset: number
  other: string
}
export type PluralFormatter = (
  value: number,
  cases: PluralFormatterOptions
) => string
export type SelectOrdinalFormatter = (
  value: number,
  cases: PluralFormatterOptions
) => string

export type SelectFormatter = (
  value: string,
  rules: Record<string, any>
) => string

export type NumberFormatter = (
  value: number,
  format: string | Intl.NumberFormatOptions
) => string

export type DateFormatter = (
  value: string,
  format: string | Intl.DateTimeFormatOptions
) => string

export type UndefinedFormatter = (value: unknown) => unknown
export type FormatterMap = {
  plural: PluralFormatter
  selectordinal: SelectOrdinalFormatter
  select: SelectFormatter
  number: NumberFormatter
  date: DateFormatter
  undefined: UndefinedFormatter
}

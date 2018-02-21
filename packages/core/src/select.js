/* @flow */

type PluralForms = {
  zero?: string,
  one?: string,
  two?: string,
  few?: string,
  many?: string,
  other: string
}

type PluralProps = {
  value: number,
  offset?: number,
  culture?: string
} & PluralForms

declare var Intl: {
  NumberFormat: any
}

const _plural = type => (i18n: any) => ({
  value,
  offset = 0,
  culture = "en-UK",
  other,
  ...pluralForms
}: PluralProps): string => {
  console.log(culture)
  const diff = value - offset
  const intl = new Intl.NumberFormat(culture)
  const diffAsString = intl.format(diff)
  const translation =
    pluralForms[value.toString()] || // exact match
    pluralForms[i18n.pluralForm(diff, type)] || // plural form
    other // fallback
  return translation.replace("#", diffAsString)
}

const plural = _plural("cardinal")
const selectOrdinal = _plural("ordinal")

type SelectProps = {
  value: string,
  other: string
}

function select({ value, other, ...selectForms }: SelectProps): string {
  return selectForms[value] || other
}

export { plural, select, selectOrdinal }

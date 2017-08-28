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
  offset?: number
} & PluralForms

const _plural = (type) => (i18n: any) => ({
  value,
  offset = 0,
  other,
  ...pluralForms
}: PluralProps): string => {
  const diff = value - offset
  const translation = (
    pluralForms[value.toString()] || // exact match
    pluralForms[i18n.pluralForm(diff, type)] || // plural form
    other // fallback
  )
  return translation.replace('#', diff.toString())
}

const plural = _plural('cardinal')
const selectOrdinal = _plural('ordinal')

type SelectProps = {
  value: string,
  other: string
}

function select ({
  value,
  other,
  ...selectForms
}: SelectProps): string {
  return selectForms[value] || other
}

export { plural, select, selectOrdinal }

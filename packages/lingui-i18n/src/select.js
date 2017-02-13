/* @flow */
import type { I18n } from './i18n'

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

const plural = (i18n: I18n) => ({
  value,
  offset = 0,
  other,
  ...pluralForms
}: PluralProps): string => {
  const translation = (
    pluralForms[(value - offset).toString()] ||      // exact match
    pluralForms[i18n.pluralForm(value - offset)] ||  // plural form
    other                                           // fallback
  )
  return translation.replace('#', value.toString())
}

const selectOrdinal = (i18n: I18n) => ({
  value,
  offset = 0,
  other,
  ...pluralForms
}: PluralProps): string => {
  const translation = (
    pluralForms[(value - offset).toString()] ||                 // exact match
    pluralForms[i18n.pluralForm(value - offset, 'ordinal')] ||  // plural form
    other                                                       // fallback
  )
  return translation.replace('#', value.toString())
}

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

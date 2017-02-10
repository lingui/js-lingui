/* @flow */
import type { I18n } from './i18n'

type PluralForms = {
  zero?: string,
  one?: string,
  few?: string,
  many?: string
}

type PluralProps = {
  value: number,
  offset?: number,
  others: string
} & PluralForms

const plural = (i18n: I18n) => ({
  value,
  offset = 0,
  others,
  ...pluralForms
}: PluralProps): string => {
  const translation = (
    pluralForms[(value - offset).toString()] ||      // exact match
    pluralForms[i18n.pluralForm(value - offset)] ||  // plural form
    others                                           // fallback
  )
  return translation.replace('#', value.toString())
}

type SelectProps = {
  value: string,
  others: string
}

function select ({
  value,
  others,
  ...selectForms
}: SelectProps): string {
  return selectForms[value] || others
}

export { plural, select }

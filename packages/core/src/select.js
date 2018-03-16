/* @flow */

import { number } from "./formats"

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
  locales?: any,
  options?: {}
} & PluralForms

declare var Intl: {
  NumberFormat: any
}

const _plural = type => (i18n: any) => ({
  value,
  offset = 0,
  locales = i18n.locales || i18n.language,
  options = {},
  other,
  ...pluralForms
}: PluralProps): string => {
  const diff = value - offset
  const diffAsString = number(locales, options)(diff)
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

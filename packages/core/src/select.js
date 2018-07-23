/* @flow */

import { number } from "./formats"
import type { NumberFormat } from "./formats"
import type { Locales, I18n } from "./i18n"

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
  locales?: Locales,
  format?: NumberFormat
} & PluralForms

declare var Intl: {
  NumberFormat: any
}

const _plural = type => (i18n: I18n) => ({
  value,
  offset = 0,
  locales,
  format,
  other,
  ...pluralForms
}: PluralProps): string => {
  if (locales === undefined) locales = i18n.locales || i18n.language

  const diff = value - offset
  const diffAsString = number(locales, format)(diff)
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

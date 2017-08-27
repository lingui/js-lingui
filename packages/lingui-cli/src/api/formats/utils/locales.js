// @flow
import plurals from 'make-plural'

export type LocaleObject = {
  language: string,
  country?: string
}

/**
 * Groups:
 * 0. and 1. locale code (1. is useful, when RegExp is part of larger pattern)
 * 2. language code
 * 4. country code
 * @type {RegExp}
 */
export const localeRe = new RegExp(/(([a-z]+)(_([a-zA-Z]+))?)/)

export function isValid (locale: string): boolean {
  const match = localeRe.exec(locale)
  return (
    match && match[0] === locale && // locale has valid format
    match[2] in plurals // language is valid (we have plurals for it)
  )
}

export function parse (locale: string): ?LocaleObject {
  const match = localeRe.exec(locale)
  if (!match || match[0] !== locale) return null

  return {
    language: match[2],
    country: match[4]
  }
}

// @flow
const plurals = require('make-plural')

export type LocaleObject = {
  language: string,
  country?: string
}

export const localeRe = /([a-z]+)(_([a-zA-Z]+))?/

export function isValid (locale: string): boolean {
  const match = localeRe.exec(locale)
  return (
    match && match[0] === locale && // locale has valid format
    match[1] in plurals // language is valid (we have plurals for it)
  )
}

export function parse (locale: string): ?LocaleObject {
  const match = localeRe.exec(locale)
  if (!match || match[0] !== locale) return null

  return {
    language: match[1],
    country: match[3]
  }
}

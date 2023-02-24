import { Catalog } from "../catalog"
import { FallbackLocales } from "@lingui/conf"
import type { AllCatalogsType, CatalogType, MessageType } from "../types"

export type TranslationMissingEvent = {
  source: string
  id: string
}
export type GetTranslationsOptions = {
  sourceLocale: string
  fallbackLocales: FallbackLocales
  onMissing?: (message: TranslationMissingEvent) => void
}

export function getTranslationsForCatalog(
  catalog: Catalog,
  locale: string,
  options: GetTranslationsOptions
) {
  const catalogs = catalog.readAll()
  const template = catalog.readTemplate() || {}

  const sourceLocaleCatalog = catalogs[options.sourceLocale] || {}

  const input = { ...template, ...sourceLocaleCatalog, ...catalogs[locale] }

  return Object.keys(input).reduce<{ [id: string]: string }>((acc, key) => {
    acc[key] = getTranslation(catalogs, input[key], locale, key, options)
    return acc
  }, {})
}

function sourceLocaleFallback(catalog: CatalogType, key: string) {
  if (!catalog?.[key]) {
    return null
  }

  return catalog[key].translation || catalog[key].message
}

function getTranslation(
  catalogs: AllCatalogsType,
  msg: MessageType,
  locale: string,
  key: string,
  options: GetTranslationsOptions
) {
  const { fallbackLocales, sourceLocale, onMissing } = options

  const getTranslation = (_locale: string) => {
    const localeCatalog = catalogs[_locale]
    return localeCatalog?.[key]?.translation
  }

  const getMultipleFallbacks = (_locale: string) => {
    const fL = fallbackLocales && fallbackLocales?.[_locale]

    // some probably the fallback will be undefined, so just search by locale
    if (!fL) return null

    if (Array.isArray(fL)) {
      for (const fallbackLocale of fL) {
        if (catalogs[fallbackLocale] && getTranslation(fallbackLocale)) {
          return getTranslation(fallbackLocale)
        }
      }
    } else {
      return getTranslation(fL)
    }
  }

  // target locale -> fallback locales -> fallback locales default ->
  // ** (following fallbacks would emit `missing` warning) **
  // -> source locale translation -> source locale message
  // -> template message
  // ** last resort **
  // -> id

  let translation =
    // Get translation in target locale
    getTranslation(locale) ||
    // We search in fallbackLocales as dependent of each locale
    getMultipleFallbacks(locale) ||
    // Get translation in fallbackLocales.default (if any)
    (fallbackLocales?.default && getTranslation(fallbackLocales.default)) ||
    (sourceLocale &&
      sourceLocale === locale &&
      sourceLocaleFallback(catalogs[sourceLocale], key))

  if (!translation) {
    onMissing &&
      onMissing({
        id: key,
        source:
          msg.message || sourceLocaleFallback(catalogs[sourceLocale], key),
      })
  }

  return (
    translation ||
    (sourceLocale && sourceLocaleFallback(catalogs[sourceLocale], key)) ||
    // take from template
    msg.message ||
    key
  )
}

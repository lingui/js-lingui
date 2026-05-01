import { FallbackLocales } from "@lingui/conf"
import type { AllCatalogsType, CatalogType, MessageType } from "../types.js"
import { getFallbackListForLocale } from "./getFallbackListForLocale.js"

export type TranslationMissingEvent = {
  source: string
  id: string
}

export type MissingBehavior = "resolved" | "catalog"

export function isMissingBehavior(value: string): value is MissingBehavior {
  return value === "resolved" || value === "catalog"
}

export type GetTranslationsOptions = {
  sourceLocale: string
  fallbackLocales: FallbackLocales
  missingBehavior?: MissingBehavior
}

type CatalogTranslationsReader = {
  readAll(locales: string[]): Promise<AllCatalogsType>
  readTemplate(): Promise<CatalogType | undefined>
}

export async function getTranslationsForCatalog(
  catalog: CatalogTranslationsReader,
  locale: string,
  options: GetTranslationsOptions,
) {
  const locales = new Set([
    locale,
    options.sourceLocale,
    ...getFallbackListForLocale(options.fallbackLocales, locale),
  ])

  const [rawCatalogs, rawTemplate] = await Promise.all([
    catalog.readAll(Array.from(locales)),
    catalog.readTemplate(),
  ])

  const catalogs = withoutObsolete(rawCatalogs)
  const template = withoutObsoleteCatalog(rawTemplate)
  const sourceLocaleCatalog = catalogs[options.sourceLocale] || {}

  const input = { ...template, ...sourceLocaleCatalog, ...catalogs[locale] }

  const missing: TranslationMissingEvent[] = []

  const messages = Object.entries(input).reduce<{ [id: string]: string }>(
    (acc, [key, msg]) => {
      acc[key] = getTranslation(
        catalogs,
        msg,
        locale,
        key,
        (event) => {
          missing.push(event)
        },
        options,
      )
      return acc
    },
    {},
  )

  return {
    missing,
    messages,
  }
}

function isActiveMessage(
  message: MessageType | undefined,
): message is MessageType {
  return Boolean(message && !message.obsolete)
}

function withoutObsolete(catalogs: AllCatalogsType): AllCatalogsType {
  return Object.fromEntries(
    Object.entries(catalogs).map(([locale, catalog]) => [
      locale,
      withoutObsoleteCatalog(catalog),
    ]),
  )
}

function withoutObsoleteCatalog(catalog: CatalogType | undefined): CatalogType {
  const activeCatalog: CatalogType = {}

  Object.entries(catalog ?? {}).forEach(([id, message]) => {
    if (isActiveMessage(message)) {
      activeCatalog[id] = message
    }
  })

  return activeCatalog
}

function sourceLocaleFallback(catalog: CatalogType | undefined, key: string) {
  const message = catalog?.[key]

  if (!isActiveMessage(message)) {
    return undefined
  }

  return message.translation || message.message
}

function getTranslation(
  catalogs: AllCatalogsType,
  msg: MessageType,
  locale: string,
  key: string,
  onMissing: (message: TranslationMissingEvent) => void,
  options: GetTranslationsOptions,
) {
  const { fallbackLocales, sourceLocale } = options

  const getCatalogTranslation = (_locale: string) => {
    const localeCatalog = catalogs[_locale]
    const message = localeCatalog?.[key]

    if (!isActiveMessage(message)) {
      return undefined
    }

    return message.translation
  }

  const getMultipleFallbacks = (_locale: string) => {
    const fL = getFallbackListForLocale(fallbackLocales, _locale)

    if (!fL.length) return null

    for (const fallbackLocale of fL) {
      const fallbackTranslation = getCatalogTranslation(fallbackLocale)

      if (catalogs[fallbackLocale] && fallbackTranslation) {
        return fallbackTranslation
      }
    }
  }

  // target locale -> fallback locales -> fallback locales default ->
  // ** (following fallbacks would emit `missing` warning) **
  // -> source locale translation -> source locale message
  // -> template message
  // ** last resort **
  // -> id
  const catalogTranslation = getCatalogTranslation(locale)

  const translation =
    // Get translation in target locale
    catalogTranslation ||
    // We search in fallbackLocales as dependent of each locale
    getMultipleFallbacks(locale) ||
    (sourceLocale &&
      sourceLocale === locale &&
      sourceLocaleFallback(catalogs[sourceLocale], key))

  const missingBehavior = options.missingBehavior ?? "resolved"
  const isMissingTranslation =
    missingBehavior === "catalog"
      ? locale !== sourceLocale && !catalogTranslation
      : !translation

  if (isMissingTranslation) {
    onMissing({
      id: key,
      source:
        msg.message || sourceLocaleFallback(catalogs[sourceLocale], key) || "",
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

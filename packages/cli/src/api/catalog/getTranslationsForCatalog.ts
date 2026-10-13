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
  ignoreObsolete?: boolean
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
  const fallbackList = getFallbackListForLocale(options.fallbackLocales, locale)
  const locales = new Set([locale, options.sourceLocale, ...fallbackList])

  const [rawCatalogs, rawTemplate] = await Promise.all([
    catalog.readAll(Array.from(locales)),
    catalog.readTemplate(),
  ])

  const ignoreObsolete = options.ignoreObsolete ?? false
  const catalogs = withoutObsolete(rawCatalogs, ignoreObsolete)
  const template = withoutObsoleteCatalog(rawTemplate, ignoreObsolete)
  const sourceLocaleCatalog = catalogs[options.sourceLocale] || {}

  const input = { ...template, ...sourceLocaleCatalog, ...catalogs[locale] }

  const missing: TranslationMissingEvent[] = []
  const missingBehavior = options.missingBehavior ?? "resolved"

  const messages = Object.entries(input).reduce<{ [id: string]: string }>(
    (acc, [key, msg]) => {
      acc[key] = getTranslation(
        catalogs,
        msg,
        locale,
        key,
        options.sourceLocale,
        fallbackList,
        ignoreObsolete,
        missingBehavior,
        (event) => {
          missing.push(event)
        },
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
  ignoreObsolete: boolean,
): message is MessageType {
  return Boolean(message && (!ignoreObsolete || !message.obsolete))
}

function withoutObsolete(
  catalogs: AllCatalogsType,
  ignoreObsolete: boolean,
): AllCatalogsType {
  return Object.fromEntries(
    Object.entries(catalogs).map(([locale, catalog]) => [
      locale,
      withoutObsoleteCatalog(catalog, ignoreObsolete),
    ]),
  )
}

function withoutObsoleteCatalog(
  catalog: CatalogType | undefined,
  ignoreObsolete: boolean,
): CatalogType {
  const activeCatalog: CatalogType = {}

  Object.entries(catalog ?? {}).forEach(([id, message]) => {
    if (isActiveMessage(message, ignoreObsolete)) {
      activeCatalog[id] = message
    }
  })

  return activeCatalog
}

function sourceLocaleFallback(
  catalog: CatalogType | undefined,
  key: string,
  ignoreObsolete: boolean,
) {
  const message = catalog?.[key]

  if (!isActiveMessage(message, ignoreObsolete)) {
    return undefined
  }

  return message.translation || message.message
}

function getTranslation(
  catalogs: AllCatalogsType,
  msg: MessageType,
  locale: string,
  key: string,
  sourceLocale: string,
  fallbackList: string[],
  ignoreObsolete: boolean,
  missingBehavior: MissingBehavior,
  onMissing: (message: TranslationMissingEvent) => void,
) {
  const getCatalogTranslation = (_locale: string) => {
    const localeCatalog = catalogs[_locale]
    const message = localeCatalog?.[key]

    if (!isActiveMessage(message, ignoreObsolete)) {
      return undefined
    }

    return message.translation
  }

  const getMultipleFallbacks = () => {
    if (!fallbackList.length) return null

    for (const fallbackLocale of fallbackList) {
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
    getMultipleFallbacks() ||
    (sourceLocale &&
      sourceLocale === locale &&
      sourceLocaleFallback(catalogs[sourceLocale], key, ignoreObsolete))

  const isMissingTranslation =
    missingBehavior === "catalog"
      ? locale !== sourceLocale && !catalogTranslation
      : !translation

  if (isMissingTranslation) {
    onMissing({
      id: key,
      source:
        msg.message ||
        sourceLocaleFallback(catalogs[sourceLocale], key, ignoreObsolete) ||
        "",
    })
  }

  return (
    translation ||
    (sourceLocale &&
      sourceLocaleFallback(catalogs[sourceLocale], key, ignoreObsolete)) ||
    // take from template
    msg.message ||
    key
  )
}

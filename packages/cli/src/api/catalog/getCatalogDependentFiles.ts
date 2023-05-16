import { Catalog } from "../catalog"
import { getFallbackListForLocale } from "./getFallbackListForLocale"

/**
 * Return all files catalog implicitly depends on.
 */
export function getCatalogDependentFiles(
  catalog: Catalog,
  locale: string
): string[] {
  const files = new Set([catalog.templateFile])
  getFallbackListForLocale(catalog.config.fallbackLocales, locale).forEach(
    (locale) => {
      files.add(catalog.getFilename(locale))
    }
  )

  if (catalog.config.sourceLocale && locale !== catalog.config.sourceLocale) {
    files.add(catalog.getFilename(catalog.config.sourceLocale))
  }

  return Array.from(files.values())
}

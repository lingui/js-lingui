import { Catalog } from "../catalog"
import { getFallbackListForLocale } from "./getFallbackListForLocale"
import fs from "node:fs/promises"

const fileExists = async (path: string) =>
  !!(await fs.stat(path).catch(() => false))

/**
 * Return all files catalog implicitly depends on.
 */
export async function getCatalogDependentFiles(
  catalog: Catalog,
  locale: string
): Promise<string[]> {
  const files = new Set([catalog.templateFile])
  getFallbackListForLocale(catalog.config.fallbackLocales, locale).forEach(
    (locale) => {
      files.add(catalog.getFilename(locale))
    }
  )

  if (catalog.config.sourceLocale && locale !== catalog.config.sourceLocale) {
    files.add(catalog.getFilename(catalog.config.sourceLocale))
  }

  const out: string[] = []

  for (const file of files) {
    if (await fileExists(file)) {
      out.push(file)
    }
  }

  return out
}

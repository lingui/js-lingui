import { Catalog } from "../catalog"
import { getFallbackListForLocale } from "./getFallbackListForLocale"
import fs from "node:fs/promises"

import path from "node:path"
import * as process from "process"

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

  for (let file of files) {
    file = path.isAbsolute(file) ? file : path.join(process.cwd(), file)

    if (await fileExists(file)) {
      out.push(file)
    }
  }

  return out
}

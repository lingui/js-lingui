import normalizePath from "normalize-path"
import nodepath from "path"
import { Catalog } from "../catalog.js"
import { CheckFindingBase } from "../findings.js"
import {
  getTranslationsForCatalog,
  TranslationMissingEvent,
} from "./getTranslationsForCatalog.js"
import type { CatalogType } from "../types.js"

export type MissingTranslationFinding = CheckFindingBase & {
  code: "missing_translation"
  locale: string
}

function createMissingTranslationMessage(messageId: string, source?: string) {
  return source || source === messageId
    ? `${messageId}: (${source})`
    : messageId
}

export async function getCatalogTranslationsWithMissing(
  catalog: Catalog,
  locale: string,
) {
  const { messages, missing } = await getTranslationsForCatalog(
    catalog,
    locale,
    {
      fallbackLocales: catalog.config.fallbackLocales,
      sourceLocale: catalog.config.sourceLocale,
      missingBehavior: "catalog",
    },
  )

  const [selectedCatalog, sourceLocaleCatalog, templateCatalog] =
    await Promise.all([
      catalog.read(locale),
      catalog.read(catalog.config.sourceLocale),
      catalog.readTemplate(),
    ])

  const activeMessageIds = getActiveMessageIds(
    selectedCatalog,
    sourceLocaleCatalog,
    templateCatalog,
  )

  return {
    messages,
    missing: missing.filter((entry) => activeMessageIds.has(entry.id)),
  }
}

function getActiveMessageIds(...catalogs: Array<CatalogType | undefined>) {
  const activeMessageIds = new Set<string>()

  catalogs.forEach((catalog) => {
    Object.entries(catalog ?? {}).forEach(([id, message]) => {
      if (!message.obsolete) {
        activeMessageIds.add(id)
      }
    })
  })

  return activeMessageIds
}

export function createMissingTranslationFinding(
  catalog: Catalog,
  locale: string,
  missing: TranslationMissingEvent,
): MissingTranslationFinding {
  const catalogPath = normalizePath(
    nodepath.relative(catalog.config.rootDir, catalog.getFilename(locale)),
  )

  return {
    code: "missing_translation",
    locale,
    catalogPath,
    message: createMissingTranslationMessage(missing.id, missing.source),
  }
}

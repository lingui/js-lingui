import normalizePath from "normalize-path"
import nodepath from "path"
import { Catalog } from "../catalog.js"
import { CheckFindingBase } from "../findings.js"
import {
  getTranslationsForCatalog,
  TranslationMissingEvent,
} from "./getTranslationsForCatalog.js"

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

  return {
    messages,
    missing,
  }
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

import { resolveTemplatePath } from "./resolveTemplatePath.js"
import {
  AllCatalogsType,
  CatalogType,
  ExtractedCatalogType,
} from "../api/index.js"
import { styleText } from "node:util"
import { resolveCatalogPath } from "./resolveCatalogPath.js"
import { mergeCatalog } from "../api/catalog/mergeCatalog.js"
import {
  AllCatalogStats,
  getAllStats,
  printCatalogStats,
} from "../api/stats.js"
import { LinguiConfigNormalized, OrderBy } from "@lingui/conf"
import { cleanObsolete, order } from "../api/catalog.js"
import { FormatterWrapper } from "../api/formats/index.js"

type ExtractTemplateParams = {
  format: FormatterWrapper
  clean: boolean
  entryPoint: string
  outputPattern: string
  linguiConfig: LinguiConfigNormalized
  messages: ExtractedCatalogType
}

type ExtractParams = ExtractTemplateParams & {
  locales: string[]
  overwrite: boolean
}

/**
 * Plain data (no terminal styling), so it can be returned from a worker thread
 */
export type ExtractStats =
  | { type: "catalogs"; stats: AllCatalogStats }
  | { type: "template"; messagesCount: number }

/**
 * Everything needed to write catalogs of one entry point,
 * except config and format which are not transferable to worker threads
 */
export type WriteEntryParams = Omit<
  ExtractParams,
  "format" | "linguiConfig"
> & {
  template: boolean
}

function cleanAndSort(catalog: CatalogType, clean: boolean, orderBy: OrderBy) {
  if (clean) {
    catalog = cleanObsolete(catalog)
  }

  return order(orderBy, catalog)
}

export async function writeCatalogs(
  params: ExtractParams,
): Promise<ExtractStats> {
  const {
    entryPoint,
    outputPattern,
    linguiConfig,
    locales,
    overwrite,
    format,
    clean,
    messages,
  } = params

  const stat: AllCatalogsType = {}

  for (const locale of locales) {
    const catalogOutput = resolveCatalogPath(
      outputPattern,
      entryPoint,
      linguiConfig.rootDir,
      locale,
      format.getCatalogExtension(),
    )

    const catalog = mergeCatalog(
      await format.read(catalogOutput, locale),
      messages,
      locale === linguiConfig.sourceLocale,
      { overwrite },
    )

    await format.write(
      catalogOutput,
      cleanAndSort(catalog, clean, linguiConfig.orderBy),
      locale,
    )

    stat[locale] = catalog
  }

  return { type: "catalogs", stats: getAllStats(stat) }
}

export async function writeTemplate(
  params: ExtractTemplateParams,
): Promise<ExtractStats> {
  const { entryPoint, outputPattern, linguiConfig, format, clean, messages } =
    params

  const catalogOutput = resolveTemplatePath(
    entryPoint,
    outputPattern,
    linguiConfig.rootDir,
    format.getTemplateExtension(),
  )

  await format.write(
    catalogOutput,
    cleanAndSort(messages as CatalogType, clean, linguiConfig.orderBy),
    undefined,
  )

  return { type: "template", messagesCount: Object.keys(messages).length }
}

export async function writeEntry(
  { template, ...params }: WriteEntryParams,
  linguiConfig: LinguiConfigNormalized,
  format: FormatterWrapper,
): Promise<ExtractStats> {
  return template
    ? writeTemplate({ ...params, linguiConfig, format })
    : writeCatalogs({ ...params, linguiConfig, format })
}

export function printExtractStats(
  linguiConfig: LinguiConfigNormalized,
  stats: ExtractStats,
): string {
  if (stats.type === "template") {
    return `${styleText(
      "bold",
      String(stats.messagesCount),
    )} message(s) extracted`
  }

  return printCatalogStats(linguiConfig, stats.stats).toString()
}

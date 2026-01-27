import { resolveTemplatePath } from "./resolveTemplatePath.js"
import {
  AllCatalogsType,
  CatalogType,
  ExtractedCatalogType,
} from "../api/index.js"
import pico from "picocolors"
import { resolveCatalogPath } from "./resolveCatalogPath.js"
import { mergeCatalog } from "../api/catalog/mergeCatalog.js"
import { printStats } from "../api/stats.js"
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
type ExtractStats = {
  statMessage: string
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

  return {
    statMessage: printStats(linguiConfig, stat).toString(),
  }
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

  return {
    statMessage: `${pico.bold(
      Object.keys(messages).length,
    )} message(s) extracted`,
  }
}

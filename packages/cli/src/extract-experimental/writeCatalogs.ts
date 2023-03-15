import { resolveTemplatePath } from "./resolveTemplatePath"
import { AllCatalogsType, CatalogType, ExtractedCatalogType } from "../api"
import chalk from "chalk"
import { resolveCatalogPath } from "./resolveCatalogPath"
import { mergeCatalog } from "../api/catalog/mergeCatalog"
import { printStats } from "../api/stats"
import { LinguiConfigNormalized, OrderBy } from "@lingui/conf"
import { cleanObsolete, order } from "../api/catalog"
import { CatalogFormatter } from "../api/formats"

type ExtractTemplateParams = {
  format: CatalogFormatter
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

  return order(orderBy)(catalog) as CatalogType
}

export async function writeCatalogs(
  params: ExtractParams
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
      format.catalogExtension
    )

    const catalog = mergeCatalog(
      format.read(catalogOutput),
      messages,
      locale === linguiConfig.sourceLocale,
      { overwrite }
    )

    format.write(
      catalogOutput,
      cleanAndSort(catalog, clean, linguiConfig.orderBy),
      {
        locale,
      }
    )

    stat[locale] = catalog
  }

  return {
    statMessage: printStats(linguiConfig, stat).toString(),
  }
}

export async function writeTemplate(
  params: ExtractTemplateParams
): Promise<ExtractStats> {
  const { entryPoint, outputPattern, linguiConfig, format, clean, messages } =
    params

  const catalogOutput = resolveTemplatePath(
    entryPoint,
    outputPattern,
    linguiConfig.rootDir,
    format.templateExtension || format.catalogExtension
  )

  format.write(
    catalogOutput,
    cleanAndSort(messages as CatalogType, clean, linguiConfig.orderBy),
    {
      locale: undefined,
    }
  )

  return {
    statMessage: `${chalk.bold(
      Object.keys(messages).length
    )} message(s) extracted`,
  }
}

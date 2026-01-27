import {
  ExperimentalExtractorOptions,
  LinguiConfigNormalized,
} from "@lingui/conf"
import { getEntryPoints } from "./getEntryPoints.js"
import { resolveCatalogPath } from "./resolveCatalogPath.js"
import { Catalog } from "../api/catalog.js"
import { resolveTemplatePath } from "./resolveTemplatePath.js"
import { FormatterWrapper } from "../api/formats/index.js"

export async function getExperimentalCatalogs(
  linguiConfig: LinguiConfigNormalized,
  format: FormatterWrapper,
  extractorConfig: ExperimentalExtractorOptions,
) {
  const config = extractorConfig
  const entryPoints = getEntryPoints(config.entries)

  return entryPoints.map((entryPoint) => {
    const catalogPath = resolveCatalogPath(
      config.output,
      entryPoint,
      linguiConfig.rootDir,
      undefined,
      "",
    )

    const templatePath = resolveTemplatePath(
      entryPoint,
      config.output,
      linguiConfig.rootDir,
      format.getTemplateExtension(),
    )

    return new Catalog(
      {
        name: undefined,
        path: catalogPath,
        templatePath,
        include: [],
        exclude: [],
        format,
      },
      linguiConfig,
    )
  })
}

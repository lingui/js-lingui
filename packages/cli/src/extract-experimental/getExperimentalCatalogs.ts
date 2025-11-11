import { LinguiConfigNormalized } from "@lingui/conf"
import { getEntryPoints } from "./getEntryPoints.js"
import { resolveCatalogPath } from "./resolveCatalogPath.js"
import { Catalog } from "../api/catalog.js"
import { resolveTemplatePath } from "./resolveTemplatePath.js"
import { getFormat } from "../api/formats/index.js"

export async function getExperimentalCatalogs(
  linguiConfig: LinguiConfigNormalized
) {
  const config = linguiConfig.experimental.extractor
  const entryPoints = getEntryPoints(config.entries)

  const format = await getFormat(
    linguiConfig.format,
    linguiConfig.formatOptions,
    linguiConfig.sourceLocale
  )

  return entryPoints.map((entryPoint) => {
    const catalogPath = resolveCatalogPath(
      config.output,
      entryPoint,
      linguiConfig.rootDir,
      undefined,
      ""
    )

    const templatePath = resolveTemplatePath(
      entryPoint,
      config.output,
      linguiConfig.rootDir,
      format.getTemplateExtension()
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
      linguiConfig
    )
  })
}

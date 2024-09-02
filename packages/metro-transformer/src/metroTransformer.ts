import { getConfig } from "@lingui/conf"
import {
  createCompiledCatalog,
  getCatalogForFile,
  getCatalogs,
} from "@lingui/cli/api"
import type { BabelTransformer, BabelTransformerArgs } from "./types"

export const createLinguiMetroTransformer = (
  upstreamTransformer: BabelTransformer
): BabelTransformer["transform"] => {
  return async function linguiMetroTransformer(params) {
    if (!params.filename.endsWith(".po")) {
      return upstreamTransformer.transform(params)
    }
    const jsSource = await transformFile(params)
    return upstreamTransformer.transform({
      ...params,
      src: jsSource,
    })
  }
}

export async function transformFile(
  params: Pick<BabelTransformerArgs, "filename">
) {
  const config = getConfig()

  const catalogRelativePath = params.filename

  const fileCatalog = getCatalogForFile(
    catalogRelativePath,
    await getCatalogs(config)
  )

  if (!fileCatalog) {
    throw new Error(
      `Requested resource ${catalogRelativePath} is not matched to any of your catalogs paths specified in "lingui.config".

Your catalogs:
${config.catalogs.map((c) => c.path).join("\n")}

Working dir is: 
${process.cwd()}

Please check that \`catalogs.path\` is filled properly and restart the Metro server.\n`
    )
  }

  const { locale, catalog } = fileCatalog

  const messages = await catalog.getTranslations(locale, {
    fallbackLocales: config.fallbackLocales,
    sourceLocale: config.sourceLocale,
  })

  const strict = process.env.NODE_ENV !== "production"

  return createCompiledCatalog(locale, messages, {
    strict,
    namespace: "es",
    pseudoLocale: config.pseudoLocale,
  })
}

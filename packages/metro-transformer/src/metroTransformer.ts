import { getConfig } from "@lingui/conf"
import {
  createCompiledCatalog,
  getCatalogForFile,
  getCatalogs,
} from "@lingui/cli/api"
import type { BabelTransformer, BabelTransformerArgs } from "./types"
import path from "path"
import memoizeOne from "memoize-one"

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

const getCatalogList = async () => {
  const config = getConfig()
  // We are aggressive at caching all catalogs because
  // in development, modifying po files doesn't matter anyway because of how core handles development.
  // In production po files don't change, and we don't need to call getCatalogs() on every request.
  const allCatalogs = await getCatalogs(config)
  return {
    config,
    allCatalogs,
  }
}
const memoizedGetCatalogList = memoizeOne(getCatalogList)

export async function transformFile(
  params: Pick<BabelTransformerArgs, "filename">
) {
  const { config, allCatalogs } = await memoizedGetCatalogList()
  const catalogPathRelativeToProjectRoot = params.filename
  const catalogPathRelativeToLinguiConfig = path.relative(
    config.rootDir,
    catalogPathRelativeToProjectRoot
  )

  const catalogFile = getCatalogForFile(
    catalogPathRelativeToLinguiConfig,
    allCatalogs
  )

  if (!catalogFile) {
    const absolutePath = path.resolve(catalogPathRelativeToProjectRoot)

    throw new Error(
      `Requested resource ${catalogPathRelativeToProjectRoot} (absolute path: ${absolutePath}) is not matched to any of your catalogs paths specified in "lingui.config".

Your catalogs:
${config.catalogs.map((c) => c.path).join("\n")}

Working dir is: 
${process.cwd()}

Please check that \`catalogs.path\` is filled properly and restart the Metro server.\n`
    )
  }

  const { locale, catalog } = catalogFile

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

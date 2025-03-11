import path from "path"
import { getConfig } from "@lingui/conf"
import {
  createCompiledCatalog,
  getCatalogs,
  getCatalogForFile,
  getCatalogDependentFiles,
  createMissingErrorMessage,
} from "@lingui/cli/api"
import type { LoaderDefinitionFunction } from "webpack"

export type LinguiLoaderOptions = {
  config?: string

  /**
   * If true would fail compilation on missing translations
   **/
  failOnMissing?: boolean
}

const loader: LoaderDefinitionFunction<LinguiLoaderOptions> = async function (
  source
) {
  const options = this.getOptions() || {}

  const config = getConfig({
    configPath: options.config,
    cwd: path.dirname(this.resourcePath),
  })

  const catalogRelativePath = path.relative(config.rootDir, this.resourcePath)

  const fileCatalog = getCatalogForFile(
    catalogRelativePath,
    await getCatalogs(config)
  )

  if (!fileCatalog) {
    throw new Error(
      `Requested resource ${catalogRelativePath} is not matched to any of your catalogs paths specified in "lingui.config".

Resource: ${this.resourcePath}

Your catalogs:
${config.catalogs.map((c) => c.path).join("\n")}

Working dir is: 
${process.cwd()}

Please check that \`catalogs.path\` is filled properly.\n`
    )
  }

  const { locale, catalog } = fileCatalog
  const dependency = await getCatalogDependentFiles(catalog, locale)
  dependency.forEach((file) => this.addDependency(path.normalize(file)))

  const { messages, missing: missingMessages } = await catalog.getTranslations(
    locale,
    {
      fallbackLocales: config.fallbackLocales,
      sourceLocale: config.sourceLocale,
    }
  )

  if (
    options.failOnMissing &&
    locale !== config.pseudoLocale &&
    missingMessages.length > 0
  ) {
    throw new Error(
      createMissingErrorMessage(locale, missingMessages, "loader")
    )
  }

  // In production, we don't want untranslated strings. It's better to use message
  // keys as a last resort.
  // In development, however, we want to catch missing strings with `missing` parameter
  // of setupI18n (core) and therefore we need to get empty translations if missing.
  const strict = process.env.NODE_ENV !== "production"

  return createCompiledCatalog(locale, messages, {
    strict,
    namespace: this._module.type === "json" ? "json" : "es",
    pseudoLocale: config.pseudoLocale,
  })
}

export default loader

import path from "path"
import { getConfig } from "@lingui/conf"
import {
  createCompiledCatalog,
  getCatalogs,
  getCatalogForFile,
  getCatalogDependentFiles,
} from "@lingui/cli/api"
import { LoaderDefinitionFunction } from "webpack"

type LinguiLoaderOptions = {
  config?: string
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

  const { locale, catalog } = getCatalogForFile(
    catalogRelativePath,
    await getCatalogs(config)
  )

  getCatalogDependentFiles(catalog, locale).forEach((locale) => {
    this.addDependency(catalog.getFilename(locale))
  })

  const messages = await catalog.getTranslations(locale, {
    fallbackLocales: config.fallbackLocales,
    sourceLocale: config.sourceLocale,
  })

  // In production we don't want untranslated strings. It's better to use message
  // keys as a last resort.
  // In development, however, we want to catch missing strings with `missing` parameter
  // of I18nProvider (React) or setupI18n (core) and therefore we need to get
  // empty translations if missing.
  const strict = process.env.NODE_ENV !== "production"

  return createCompiledCatalog(locale, messages, {
    strict,
    namespace: this._module.type === "json" ? "json" : "es",
    pseudoLocale: config.pseudoLocale,
  })
}

export default loader

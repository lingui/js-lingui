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
  dependency.forEach((file) => this.addDependency(file))

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

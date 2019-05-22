import path from "path"
import * as R from "ramda"
import { getConfig } from "@lingui/conf"
import { createCompiledCatalog, configureCatalog } from "@lingui/cli/api"
import loaderUtils from "loader-utils"

// Check if JavascriptParser and JavascriptGenerator exists -> Webpack 4
let JavascriptParser
let JavascriptGenerator
try {
  JavascriptParser = require("webpack/lib/Parser")
  JavascriptGenerator = require("webpack/lib/JavascriptGenerator")
} catch (error) {
  if (error.code !== "MODULE_NOT_FOUND") {
    throw e
  }
}

export default function(source) {
  const options = loaderUtils.getOptions(this)

  // Webpack 4 uses json-loader automatically, which breaks this loader because it
  // doesn't return JSON, but JS module. This is a temporary workaround before
  // official API is added (https://github.com/webpack/webpack/issues/7057#issuecomment-381883220)
  // See https://github.com/webpack/webpack/issues/7057
  if (JavascriptParser && JavascriptGenerator) {
    this._module.type = "javascript/auto"
    this._module.parser = new JavascriptParser()
    this._module.generator = new JavascriptGenerator()
  }

  const config = getConfig({
    configPath: options.config,
    cwd: path.dirname(this.resourcePath)
  })
  const catalog = configureCatalog(config)

  const locale = catalog.getLocale(this.resourcePath)

  const catalogs = catalog.readAll()
  const messages = R.mapObjIndexed(
    (_, key) =>
      catalog.getTranslation(catalogs, locale, key, {
        fallbackLocale: config.fallbackLocale,
        sourceLocale: config.sourceLocale
      }),
    catalogs[locale]
  )

  // In production we don't want untranslated strings. It's better to use message
  // keys as a last resort.
  // In development, however, we want to catch missing strings with `missing` parameter
  // of I18nProvider (React) or setupI18n (core) and therefore we need to get
  // empty translations if missing.
  const strict = process.env.NODE_ENV !== "production"
  return createCompiledCatalog(
    locale,
    messages,
    strict,
    config.compileNamespace,
    config.pseudoLocale
  )
}

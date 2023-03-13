import path from "path"
import { CatalogFormat, getConfig } from "@lingui/conf"
import {
  createCompiledCatalog,
  getCatalogs,
  getCatalogForFile,
} from "@lingui/cli/api"
import loaderUtils from "loader-utils"
// Check if webpack 5
const isWebpack5 = parseInt(require("webpack").version) === 5

// Check if JavascriptParser and JavascriptGenerator exists -> Webpack 4
let JavascriptParser
let JavascriptGenerator
try {
  JavascriptParser = require("webpack/lib/Parser")
  JavascriptGenerator = require("webpack/lib/JavascriptGenerator")
} catch (error) {
  if (error.code !== "MODULE_NOT_FOUND") {
    throw error
  }
}

const requiredType = "javascript/auto"

export default function (source) {
  const options = loaderUtils.getOptions(this) || {}

  if (!isWebpack5 && JavascriptParser && JavascriptGenerator) {
    // Webpack 4 uses json-loader automatically, which breaks this loader because it
    // doesn't return JSON, but JS module. This is a temporary workaround before
    // official API is added (https://github.com/webpack/webpack/issues/7057#issuecomment-381883220)
    // See https://github.com/webpack/webpack/issues/7057
    this._module.type = requiredType
    this._module.parser = new JavascriptParser()
    this._module.generator = new JavascriptGenerator()
  }

  const config = getConfig({
    configPath: options.config,
    cwd: path.dirname(this.resourcePath),
  })

  const EMPTY_EXT = /\.[0-9a-z]+$/.test(this.resourcePath)
  const JS_EXT = /\.js+$/.test(this.resourcePath)

  const catalogRelativePath = path.relative(config.rootDir, this.resourcePath)

  if (!EMPTY_EXT || JS_EXT) {
    const formats = {
      minimal: ".json",
      po: ".po",
      lingui: ".json",
    }
    // we replace the .js, because webpack appends automatically the .js on imports without extension
    throw new Error(
      `File extension is mandatory, for ex: import("@lingui/loader!./${catalogRelativePath.replace(
        ".js",
        formats[config.format as CatalogFormat]
      )}")`
    )
  }

  const { locale, catalog } = getCatalogForFile(
    catalogRelativePath,
    getCatalogs(config)
  )

  const messages = catalog.getTranslations(locale, {
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
    namespace: config.compileNamespace,
    pseudoLocale: config.pseudoLocale,
  })
}

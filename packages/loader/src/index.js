import path from "path"
import R from "ramda"
import { getConfig } from "@lingui/conf"
import { createCompiledCatalog, formats } from "@lingui/cli/api"

export default function(source) {
  const config = getConfig({ cwd: path.dirname(this.resourcePath) })
  const format = formats[config.format](config)

  const locales = format.getLocales()
  const locale = format.getLocale(this.resourcePath)

  const catalogs = R.mergeAll(
    locales.map(locale => ({ [locale]: format.read(locale) }))
  )

  const messages = R.mergeAll(
    Object.keys(catalogs[locale]).map(key => ({
      [key]: format.getTranslation(catalogs, locale, key, {
        fallbackLocale: config.fallbackLocale,
        sourceLocale: config.sourceLocale
      })
    }))
  )

  return createCompiledCatalog(locale, messages)
}

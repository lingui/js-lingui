import R from 'ramda'
import getConfig from 'lingui-conf'
import { createCompiledCatalog } from 'lingui-cli/dist/api/compile'

export default function (source) {
  const config = getConfig()
  const format = require(`lingui-cli/dist/api/formats/${config.format}`).default(config)

  const locales = format.getLocales()
  const locale = format.getLocale(this.resourcePath)

  const catalogs = R.mergeAll(
    locales.map((locale) => ({ [locale]: format.read(locale) }))
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

import path from "path"
import R from "ramda"
import { getConfig } from "@lingui/conf"
import { createCompiledCatalog, formats } from "@lingui/cli/api"

export default function(source) {
  const config = getConfig({ cwd: path.dirname(this.resourcePath) })
  const format = formats[config.format](config)

  const locale = format.getLocale(this.resourcePath)

  const catalogs = format.readAll()
  const messages = R.mapObjIndexed(
    (_, key) =>
      format.getTranslation(catalogs, locale, key, {
        fallbackLocale: config.fallbackLocale,
        sourceLocale: config.sourceLocale
      }),
    catalogs[locale]
  )

  return createCompiledCatalog(locale, messages)
}

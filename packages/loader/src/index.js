import path from "path"
import R from "ramda"
import { getConfig } from "@lingui/conf"
import { createCompiledCatalog, configureCatalog } from "@lingui/cli/api"

export default function(source) {
  const config = getConfig({ cwd: path.dirname(this.resourcePath) })
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

  return createCompiledCatalog(locale, messages)
}

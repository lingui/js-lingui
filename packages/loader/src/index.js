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

  // In production we don't want untranslated strings. It's better to use message
  // keys as a last resort.
  // In development, however, we want to catch missing strings with `missing` parameter
  // of I18nProvider (React) or setupI18n (core) and therefore we need to get
  // empty translations if missing.
  const strict = process.env.NODE_ENV !== "production"
  return createCompiledCatalog(locale, messages, strict)
}

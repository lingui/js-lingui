import { getCatalogs } from "./catalog/getCatalogs.js"
import { LinguiConfigNormalized } from "@lingui/conf"

/**
 * Return paths of catalogs to watch
 */
export async function getPathForCompileWatcher(config: LinguiConfigNormalized) {
  const catalogs = await getCatalogs(config)

  const paths = new Set<string>()

  config.locales.forEach((locale) => {
    catalogs.forEach((catalog) => {
      const filename = catalog.getFilename(locale)
      paths.add(filename)
    })
  })

  return { paths: [...paths] }
}

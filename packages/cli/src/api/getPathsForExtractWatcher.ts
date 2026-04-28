import { getCatalogs } from "./catalog/getCatalogs.js"
import { LinguiConfigNormalized } from "@lingui/conf"

/**
 * returns glob patterns to match
 */
export async function getPathsForExtractWatcher(
  config: LinguiConfigNormalized,
) {
  const catalogs = await getCatalogs(config)
  const paths: string[] = []
  const ignored: string[] = []

  catalogs.forEach((catalog) => {
    paths.push(...catalog.include)
    ignored.push(...catalog.exclude)
  })

  return { paths, ignored }
}

import { getConfig, LinguiConfigNormalized } from "@lingui/conf"
import { getCatalogs } from "../api/catalog/getCatalogs.js"
import {
  getMissingTranslationFindings,
  MissingTranslationFinding,
} from "../api/catalog/translations.js"
import type { MissingBehavior } from "../api/catalog/getTranslationsForCatalog.js"

export type MissingWorkerFunction = typeof missingWorker

let linguiConfig: LinguiConfigNormalized | undefined
let catalogs: Awaited<ReturnType<typeof getCatalogs>> | undefined

export const missingWorker = async (
  catalogPath: string,
  locale: string,
  missingBehavior: MissingBehavior,
  linguiConfigPath: string,
): Promise<MissingTranslationFinding[]> => {
  if (!linguiConfig) {
    // initialize config once per worker, speed up workers follow execution
    linguiConfig = getConfig({
      configPath: linguiConfigPath,
      skipValidation: true,
    })
  }

  if (!catalogs) {
    // catalogs depend only on the config, so initialize them once per worker
    catalogs = await getCatalogs(linguiConfig)
  }

  const catalog = catalogs.find((catalog) => catalog.path === catalogPath)
  if (!catalog) {
    throw new Error(`Unable to find catalog at path ${catalogPath}.`)
  }

  return getMissingTranslationFindings(catalog, locale, missingBehavior)
}

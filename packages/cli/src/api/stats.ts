import Table from "cli-table3"
import { styleText } from "node:util"

import { LinguiConfigNormalized } from "@lingui/conf"

import { AllCatalogsType, CatalogType } from "./types.js"

type CatalogStats = [number, number]

export type AllCatalogStats = {
  // null if no catalog exists on disk and the locale
  // was not extracted due to a `--locale` filter
  [locale: string]: CatalogStats | null
}

export function getStats(catalog: CatalogType): CatalogStats {
  return [
    Object.keys(catalog).length,
    Object.keys(catalog).filter((key) => !catalog[key]!.translation).length,
  ]
}

export function getAllStats(catalogs: AllCatalogsType): AllCatalogStats {
  return Object.fromEntries(
    Object.entries(catalogs).map(([locale, catalog]) => [
      locale,
      catalog ? getStats(catalog) : null,
    ]),
  )
}

export function printStats(
  config: LinguiConfigNormalized,
  catalogs: AllCatalogsType,
) {
  return printCatalogStats(config, getAllStats(catalogs))
}

/**
 * Renders already computed stats. Lets workers return plain numbers
 * and leave the terminal styling to the main thread.
 */
export function printCatalogStats(
  config: LinguiConfigNormalized,
  stats: AllCatalogStats,
) {
  const table = new Table({
    head: ["Language", "Total count", "Missing"],
    colAligns: ["left", "center", "center"],
    style: {
      head: ["green"],
      border: [],
      compact: true,
    },
  })

  Object.keys(stats)
    .sort((a, b) => {
      if (a === config.sourceLocale && b !== config.sourceLocale) return -1
      if (b === config.sourceLocale && a !== config.sourceLocale) return 1
      return a.localeCompare(b)
    })
    .forEach((locale) => {
      // skip pseudo locale
      if (config.pseudoLocale.some((item) => item.locale === locale)) return

      const [all, translated] = stats[locale] ?? ["-", "-"]

      if (config.sourceLocale === locale) {
        table.push({ [`${styleText("bold", locale)} (source)`]: [all, "-"] })
      } else {
        table.push({ [locale]: [all, translated] })
      }
    })

  return table
}

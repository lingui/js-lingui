import Table from "cli-table"
import chalk from "chalk"

import { LinguiConfig } from "@lingui/conf"

import { CatalogType, AllCatalogsType } from "./catalog"

type CatalogStats = [number, number]

export function getStats(catalog: CatalogType): CatalogStats {
  const allMessages = []
  Object.values(catalog).forEach(messageOrContext => {
    if (messageOrContext.hasOwnProperty('origin') || messageOrContext.hasOwnProperty('translation')) {
      allMessages.push(messageOrContext)
    } else {
      allMessages.push(...Object.values(messageOrContext))
    }
  })
  return [
    allMessages.length,
    allMessages.filter((message) => !message.translation).length,
  ]
}

export function printStats(config: LinguiConfig, catalogs: AllCatalogsType) {
  const table = new Table({
    head: ["Language", "Total count", "Missing"],
    colAligns: ["left", "middle", "middle"],
    style: {
      head: ["green"],
      border: [],
      compact: true,
    },
  })

  Object.keys(catalogs).forEach((locale) => {
    const catalog = catalogs[locale]
    // catalog is null if no catalog exists on disk and the locale
    // was not extracted due to a `--locale` filter
    const [all, translated] = catalog ? getStats(catalog) : ["-", "-"]

    if (config.sourceLocale === locale) {
      table.push({ [`${chalk.bold(locale)} (source)`]: [all, "-"] })
    } else {
      table.push({ [locale]: [all, translated] })
    }
  })

  return table
}

// @flow
import Table from 'cli-table'
import chalk from 'chalk'

import type { CatalogType, AllCatalogsType, LinguiConfig } from './formats/types'

type CatalogStats = [number, number]

export function getStats (catalog: CatalogType): CatalogStats {
  return [
    Object.keys(catalog).length,
    Object.keys(catalog).filter(key => !catalog[key].translation).length
  ]
}

export function printStats (config: LinguiConfig, catalogs: AllCatalogsType) {
  const table = new Table({
    head: ['Language', 'Total count', 'Missing'],
    colAligns: ['left', 'middle', 'middle'],
    style: {
      head: ['green'],
      border: [],
      compact: true
    }
  })

  Object.keys(catalogs).forEach(
    locale => {
      const [ all, translated ] = getStats(catalogs[locale])
      if (config.sourceLocale === locale) {
        table.push({[`${chalk.bold(locale)} (source)`]: [ all, '-' ]})
      } else {
        table.push({[locale]: [ all, translated ]})
      }
    }
  )

  console.log(table.toString())
}

// @flow
import Table from 'cli-table'

import type { CatalogType, AllCatalogsType } from './formats/types'

type CatalogStats = [number, number]

export function getStats (catalog: CatalogType): CatalogStats {
  return [
    Object.keys(catalog).length,
    Object.keys(catalog).filter(key => !catalog[key].translation).length
  ]
}

export function printStats (catalogs: AllCatalogsType) {
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
    locale => table.push({[locale]: getStats(catalogs[locale])})
  )

  console.log(table.toString())
}

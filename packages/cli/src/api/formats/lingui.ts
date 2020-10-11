import fs from "fs"
import * as R from "ramda"

import { writeFileIfChanged } from "../utils"
import { CatalogType } from "../types"
import { CatalogFormatter } from "./types"

type NoOriginsCatalogType = {
  [P in keyof CatalogType]: Omit<CatalogType[P], "origin">
}

const removeOrigins = (R.map(
  ({ origin, ...message }) => message
) as unknown) as (catalog: CatalogType) => NoOriginsCatalogType

const lingui: CatalogFormatter = {
  catalogExtension: ".json",

  write(filename, catalog, options) {
    let outputCatalog: CatalogType | NoOriginsCatalogType = catalog
    if (options.origins === false) {
      outputCatalog = removeOrigins(catalog)
    }
    writeFileIfChanged(filename, JSON.stringify(outputCatalog, null, 2))
  },

  read(filename) {
    const raw = fs.readFileSync(filename).toString()

    try {
      return JSON.parse(raw)
    } catch (e) {
      console.error(`Cannot read ${filename}: ${e.message}`)
      return null
    }
  },
}

export default lingui

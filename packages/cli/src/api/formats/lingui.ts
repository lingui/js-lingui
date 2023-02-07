import fs from "fs"
import * as R from "ramda"

import { writeFileIfChanged } from "../utils"
import { ExtractedMessageType, CatalogType } from "../catalog"
import { CatalogFormatter } from "."

type NoOriginsCatalogType = {
  [P in keyof CatalogType]: Omit<CatalogType[P], "origin">
}

const removeOrigins = R.map(({ origin, ...message }) => message) as unknown as (
  catalog: CatalogType
) => NoOriginsCatalogType

const removeLineNumbers = R.map((message: ExtractedMessageType) => {
  if (message.origin) {
    message.origin.map((originValue) => {
      originValue.pop()
      return originValue
    })
  }
  return message
}) as unknown as (catalog: ExtractedMessageType) => NoOriginsCatalogType

const lingui: CatalogFormatter = {
  catalogExtension: ".json",

  write(filename, catalog, options) {
    let outputCatalog: CatalogType | NoOriginsCatalogType = catalog
    if (options.origins === false) {
      outputCatalog = removeOrigins(catalog)
    }
    if (options.origins !== false && options.lineNumbers === false) {
      outputCatalog = removeLineNumbers(outputCatalog)
    }
    writeFileIfChanged(filename, JSON.stringify(outputCatalog, null, 2))
  },

  read(filename) {
    const raw = fs.readFileSync(filename).toString()

    try {
      return JSON.parse(raw)
    } catch (e) {
      throw new Error(`Cannot read ${filename}: ${e.message}`)
    }
  },

  parse(content) {
    return content
  },
}

export default lingui

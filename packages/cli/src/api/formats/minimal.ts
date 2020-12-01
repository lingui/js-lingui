import fs from "fs"
import * as R from "ramda"

import { writeFileIfChanged } from "../utils"
import { MessageType, CatalogType } from "../catalog"
import { CatalogFormatter } from "."

type MinimalCatalogType = Record<string, string>

const serialize = (R.map(
  (message: MessageType) => message.translation || ""
) as unknown) as (catalog: CatalogType) => MinimalCatalogType

const deserialize = (R.map((translation: string) => ({
  translation,
  obsolete: false,
  message: null,
  origin: [],
})) as unknown) as (minimalCatalog: MinimalCatalogType) => CatalogType

const minimal: CatalogFormatter = {
  catalogExtension: ".json",

  write(filename, catalog) {
    const messages = serialize(catalog)
    writeFileIfChanged(filename, JSON.stringify(messages, null, 2))
  },

  read(filename) {
    const raw = fs.readFileSync(filename).toString()

    try {
      const rawCatalog: Record<string, string> = JSON.parse(raw)
      return deserialize(rawCatalog)
    } catch (e) {
      throw new Error(`Cannot read ${filename}: ${e.message}`)
    }
  },
}

export default minimal

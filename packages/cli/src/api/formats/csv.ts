import fs from "fs"
import Papa from "papaparse"

import { writeFileIfChanged } from "../utils"
import { MessageType } from "../catalog"
import { CatalogFormatter } from "."

const serialize = (catalog) => {
  const rawArr = Object.keys(catalog).map((key) => [
    key,
    catalog[key].translation,
  ])
  return Papa.unparse(rawArr)
}

const deserialize = (raw: string): { [key: string]: MessageType } => {
  const rawCatalog = Papa.parse(raw)
  const messages = {}
  if (rawCatalog.errors.length) {
    throw new Error(
      rawCatalog.errors.map((err) => JSON.stringify(err)).join(";")
    )
  }
  rawCatalog.data.forEach(([key, translation]) => {
    messages[key] = {
      translation,
      obsolete: false,
      message: null,
      origin: [],
    }
  })
  return messages
}

const csv: CatalogFormatter = {
  catalogExtension: ".csv",

  write(filename, catalog) {
    const messages = serialize(catalog)
    writeFileIfChanged(filename, messages)
  },

  read(filename) {
    const raw = fs.readFileSync(filename).toString()
    try {
      return deserialize(raw)
    } catch (e) {
      throw new Error(`Cannot read ${filename}: ${e.message}`)
    }
  },
}

export default csv

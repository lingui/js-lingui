import fs from "fs"

import { writeFileIfChanged } from "../utils"
import { MessageType } from "../types"

const serialize = (catalog) => {
  var row = ""
  for (const key of Object.keys(catalog)) {
    var cur = catalog[key]
    row += `\"${key}\"`
    row += `,\"${cur.translation}\"` || ""
    row += "\n"
  }
  return row
}

const deserialize = (raw: string): { [key: string]: MessageType } => {
  const rows = raw.split("\n")
  var rawCatalog = {}
  rows.forEach((row) => {
    for (let i = 0; i < row.length; i++) {
      if (row[i] === "," && row[i - 1] === '"' && row[i + 1] === '"') {
        rawCatalog[row.substring(1, i - 1)] = {
          translation: row.substring(i + 2, row.length - 1),
          obsolete: false,
          message: null,
          origin: [],
        }
      }
    }
  })
  return rawCatalog
}

export default {
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
      console.error(`Cannot read ${filename}: ${e.message}`)
      return null
    }
  },
}

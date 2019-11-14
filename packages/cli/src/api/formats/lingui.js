// @flow
import fs from "fs"
import * as R from "ramda"

import type { TranslationsFormat } from "../types"

const removeOrigins = R.map(({ origin, ...message }) => message)

const format: TranslationsFormat = {
  filename: "messages.json",

  write(filename, catalog, options = {}) {
    let outputCatalog = catalog
    if (options.origins === false) {
      outputCatalog = removeOrigins(catalog)
    }
    fs.writeFileSync(filename, JSON.stringify(outputCatalog, null, 2))
  },

  read(filename) {
    const raw = fs.readFileSync(filename).toString()

    try {
      return JSON.parse(raw)
    } catch (e) {
      console.error(`Cannot read ${filename}: ${e.message}`)
      return null
    }
  }
}

export default format

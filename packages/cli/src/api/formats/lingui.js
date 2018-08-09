// @flow
import fs from "fs"

import type { TranslationsFormat } from "../types"

const format: TranslationsFormat = {
  filename: "messages.json",

  write(filename, catalog) {
    fs.writeFileSync(filename, JSON.stringify(catalog, null, 2))
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

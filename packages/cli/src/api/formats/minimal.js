// @flow
import fs from "fs"
import * as R from "ramda"

import type { TranslationsFormat } from "../types"

const serialize = R.map(message => message.translation || "")

const deserialize = R.map(translation => ({
  translation,
  defaults: null,
  origin: []
}))

const format: TranslationsFormat = {
  filename: "messages.json",
  messageFileExtension: ".def.json",
  catalogExtension: ".json",
  write(filename, catalog) {
    const messages = serialize(catalog)
    fs.writeFileSync(filename, JSON.stringify(messages, null, 2))
  },

  read(filename) {
    const raw = fs.readFileSync(filename).toString()

    try {
      return deserialize(JSON.parse(raw))
    } catch (e) {
      console.error(`Cannot read ${filename}: ${e.message}`)
      return null
    }
  }
}

export default format

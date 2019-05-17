import fs from "fs"
import * as R from "ramda"

import { MessageType, TranslationsFormat } from "../types"

const serialize = R.map((message: MessageType) => message.translation || "")

const deserialize = R.map((translation: string) => ({
  translation,
  obsolete: false,
  message: null,
  origin: []
}))

const format: TranslationsFormat = {
  filename: "messages.json",
  write(filename, catalog) {
    const messages = serialize(catalog)
    fs.writeFileSync(filename, JSON.stringify(messages, null, 2))
  },

  read(filename) {
    const raw = fs.readFileSync(filename).toString()

    try {
      const rawCatalog: { [key: string]: string } = JSON.parse(raw)
      return deserialize(rawCatalog)
    } catch (e) {
      console.error(`Cannot read ${filename}: ${e.message}`)
      return null
    }
  }
}

export default format

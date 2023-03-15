import Papa from "papaparse"

import { readFile, writeFileIfChanged } from "../utils"
import type { CatalogFormatter } from "@lingui/conf"
import { CatalogType, MessageType } from "../types"

const serialize = (catalog: CatalogType) => {
  const rawArr = Object.keys(catalog).map((key) => [
    key,
    catalog[key].translation,
  ])
  return Papa.unparse(rawArr)
}

const deserialize = (raw: string): { [key: string]: MessageType } => {
  const rawCatalog = Papa.parse<[string, string]>(raw)
  const messages: CatalogType = {}
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

export default function (): CatalogFormatter {
  return {
    catalogExtension: ".csv",

    async write(filename: string, catalog: CatalogType) {
      const messages = serialize(catalog)
      await writeFileIfChanged(filename, messages)
    },

    async read(filename: string) {
      const raw = await readFile(filename)

      if (!raw) {
        return null
      }

      try {
        return deserialize(raw)
      } catch (e) {
        throw new Error(`Cannot read ${filename}: ${(e as Error).message}`)
      }
    },
  }
}

import Papa from "papaparse"

import type { CatalogFormatter, CatalogType, MessageType } from "@lingui/conf"

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
      rawCatalog.errors.map((err) => JSON.stringify(err)).join(";"),
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

export function formatter(): CatalogFormatter {
  return {
    catalogExtension: ".csv",

    parse(content: string): CatalogType {
      return deserialize(content)
    },

    serialize(catalog) {
      return serialize(catalog)
    },
  }
}

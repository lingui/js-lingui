import * as R from "ramda"

import { CatalogFormatter } from "."
import type { CatalogType, MessageType } from "../types"
import { readFile, writeFile } from "../utils"

type MinimalCatalogType = Record<string, string>

const serialize = R.map(
  (message: MessageType) => message.translation || ""
) as unknown as (catalog: CatalogType) => MinimalCatalogType

const deserialize = R.map((translation: string) => ({
  translation,
  obsolete: false,
  message: null,
  origin: [],
})) as unknown as (minimalCatalog: MinimalCatalogType) => CatalogType

const minimal: CatalogFormatter = {
  catalogExtension: ".json",

  write(filename, catalog) {
    const messages = serialize(catalog)
    let file = readFile(filename)

    const shouldUseTrailingNewline = file === null || file?.endsWith("\n")
    const trailingNewLine = shouldUseTrailingNewline ? "\n" : ""
    writeFile(
      filename,
      `${JSON.stringify(messages, null, 2)}${trailingNewLine}`
    )
  },

  read(filename) {
    const raw = readFile(filename)

    if (!raw) {
      return null
    }

    try {
      const rawCatalog: Record<string, string> = JSON.parse(raw)
      return deserialize(rawCatalog)
    } catch (e) {
      throw new Error(`Cannot read ${filename}: ${(e as Error).message}`)
    }
  },

  parse(content: Record<string, any>) {
    return deserialize(content)
  },
}

export default minimal

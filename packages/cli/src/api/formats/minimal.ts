import fs from "fs"
import * as R from "ramda"

import { MessageType, CatalogType } from "../catalog"
import { CatalogFormatter } from "."

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
    let file = null
    try {
      file = fs.readFileSync(filename, "utf8")
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error
      }
    }
    const shouldUseTrailingNewline = file === null || file?.endsWith("\n")
    const trailingNewLine = shouldUseTrailingNewline ? "\n" : ""
    fs.writeFileSync(
      filename,
      `${JSON.stringify(messages, null, 2)}${trailingNewLine}`
    )
  },

  read(filename) {
    const raw = fs.readFileSync(filename).toString()

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

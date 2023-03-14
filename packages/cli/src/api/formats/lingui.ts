import * as R from "ramda"

import { readFile, writeFileIfChanged } from "../utils"
import { CatalogType, ExtractedMessageType } from "../types"
import { CatalogFormatter } from "@lingui/conf"

export type LinguiFormatterOptions = {
  origins?: boolean
  lineNumbers?: boolean
}

type NoOriginsCatalogType = {
  [P in keyof CatalogType]: Omit<CatalogType[P], "origin">
}

const removeOrigins = R.map(({ origin, ...message }) => message) as unknown as (
  catalog: CatalogType
) => NoOriginsCatalogType

const removeLineNumbers = R.map((message: ExtractedMessageType) => {
  if (message.origin) {
    message.origin.map((originValue) => {
      originValue.pop()
      return originValue
    })
  }
  return message
}) as unknown as (catalog: ExtractedMessageType) => NoOriginsCatalogType

export default function (
  options: LinguiFormatterOptions = {}
): CatalogFormatter {
  options = {
    origins: true,
    lineNumbers: true,
    ...options,
  }
  return {
    catalogExtension: ".json",

    async write(filename, catalog) {
      let outputCatalog: CatalogType | NoOriginsCatalogType = catalog
      if (options.origins === false) {
        outputCatalog = removeOrigins(catalog)
      }
      if (options.origins !== false && options.lineNumbers === false) {
        outputCatalog = removeLineNumbers(outputCatalog)
      }
      await writeFileIfChanged(filename, JSON.stringify(outputCatalog, null, 2))
    },

    async read(filename) {
      const raw = await readFile(filename)

      if (!raw) {
        return null
      }

      try {
        return JSON.parse(raw)
      } catch (e) {
        throw new Error(`Cannot read ${filename}: ${(e as Error).message}`)
      }
    },

    async parse(content) {
      return content as CatalogType
    },
  }
}

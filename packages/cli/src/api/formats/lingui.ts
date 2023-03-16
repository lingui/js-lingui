import * as R from "ramda"

import {
  CatalogFormatter,
  CatalogType,
  ExtractedMessageType,
} from "@lingui/conf"

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
    message.origin = message.origin.map(([file]) => [file])
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

    serialize(catalog, { existing }) {
      let outputCatalog: CatalogType | NoOriginsCatalogType = catalog

      if (options.origins === false) {
        outputCatalog = removeOrigins(outputCatalog)
      }
      if (options.origins !== false && options.lineNumbers === false) {
        outputCatalog = removeLineNumbers(outputCatalog)
      }

      const shouldUseTrailingNewline =
        existing === null || existing?.endsWith("\n")
      const trailingNewLine = shouldUseTrailingNewline ? "\n" : ""

      return JSON.stringify(outputCatalog, null, 2) + trailingNewLine
    },

    parse(content) {
      return JSON.parse(content)
    },
  }
}

import * as R from "ramda"

import {
  CatalogFormatter,
  CatalogType,
  ExtractedMessageType,
  MessageType,
} from "@lingui/conf"

export type JsonFormatterOptions = {
  origins?: boolean
  lineNumbers?: boolean
  style?: "lingui" | "minimal"
}

type NoOriginsCatalogType = {
  [P in keyof CatalogType]: Omit<CatalogType[P], "origin">
}

type MinimalCatalogType = Record<string, string>

const serializeMinimal = R.map(
  (message: MessageType) => message.translation || ""
) as unknown as (catalog: CatalogType) => MinimalCatalogType

const deserializeMinimal = R.map((translation: string) => ({
  translation,
  obsolete: false,
  message: null,
  origin: [],
})) as unknown as (minimalCatalog: MinimalCatalogType) => CatalogType

const removeOrigins = R.map(({ origin, ...message }) => message) as unknown as (
  catalog: CatalogType
) => NoOriginsCatalogType

const removeLineNumbers = R.map((message: ExtractedMessageType) => {
  if (message.origin) {
    message.origin = message.origin.map(([file]) => [file])
  }
  return message
}) as unknown as (catalog: ExtractedMessageType) => NoOriginsCatalogType

export function formatter(
  options: JsonFormatterOptions = {}
): CatalogFormatter {
  options = {
    origins: true,
    lineNumbers: true,
    ...options,
  }
  return {
    catalogExtension: ".json",

    serialize(catalog, { existing }) {
      let outputCatalog: any = catalog

      if (options.origins === false) {
        outputCatalog = removeOrigins(outputCatalog)
      }
      if (options.origins !== false && options.lineNumbers === false) {
        outputCatalog = removeLineNumbers(outputCatalog)
      }

      const shouldUseTrailingNewline =
        existing === null || existing?.endsWith("\n")
      const trailingNewLine = shouldUseTrailingNewline ? "\n" : ""

      if (options.style === "minimal") {
        outputCatalog = serializeMinimal(outputCatalog)
      }

      return JSON.stringify(outputCatalog, null, 2) + trailingNewLine
    },

    parse(content) {
      const catalog = JSON.parse(content)

      if (options.style === "minimal") {
        return deserializeMinimal(catalog)
      }
      return catalog
    },
  }
}

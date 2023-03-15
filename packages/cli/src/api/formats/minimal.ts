import * as R from "ramda"

import type { CatalogFormatter, CatalogType, MessageType } from "@lingui/conf"

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

export default function (): CatalogFormatter {
  return {
    catalogExtension: ".json",

    serialize(catalog: CatalogType, { existing }) {
      const shouldUseTrailingNewline =
        existing === null || existing?.endsWith("\n")
      const trailingNewLine = shouldUseTrailingNewline ? "\n" : ""

      return JSON.stringify(serialize(catalog), null, 2) + trailingNewLine
    },

    parse(content) {
      return deserialize(JSON.parse(content))
    },
  }
}

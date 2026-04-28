import {
  CatalogFormatter,
  CatalogType,
  ExtractedMessageType,
} from "@lingui/conf"

export type JsonFormatterOptions = {
  /**
   * Print places where message is used
   *
   * @default true
   */
  origins?: boolean

  /**
   * Print line numbers in origins
   *
   * @default true
   */
  lineNumbers?: boolean

  /**
   * Different styles of how information could be printed
   *
   * @default "lingui"
   */
  style?: "lingui" | "minimal"

  /**
   * Indentation of output JSON
   *
   * @default 2
   */
  indentation?: number
}

type NoOriginsCatalogType = {
  [P in keyof CatalogType]: Omit<CatalogType[P], "origin">
}

type MinimalCatalogType = Record<string, string>

const serializeMinimal = (catalog: CatalogType): MinimalCatalogType => {
  const result: MinimalCatalogType = {}
  for (const key in catalog) {
    result[key] = catalog[key].translation || ""
  }
  return result
}

const deserializeMinimal = (
  minimalCatalog: MinimalCatalogType,
): CatalogType => {
  const result: CatalogType = {}
  for (const key in minimalCatalog) {
    result[key] = {
      translation: minimalCatalog[key],
      obsolete: false,
      message: null,
      origin: [],
    }
  }
  return result
}

const removeOrigins = (catalog: CatalogType): NoOriginsCatalogType => {
  const result: NoOriginsCatalogType = {}
  for (const key in catalog) {
    const { origin, ...message } = catalog[key]
    result[key] = message
  }
  return result
}

const removeLineNumbers = (
  catalog: ExtractedMessageType,
): NoOriginsCatalogType => {
  const result: NoOriginsCatalogType = {}
  for (const key in catalog) {
    result[key] = {
      ...catalog[key],
      origin: catalog[key].origin?.map(([file]) => [file]),
    }
  }
  return result
}

export function formatter(
  options: JsonFormatterOptions = {},
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

      return (
        JSON.stringify(outputCatalog, null, options.indentation ?? 2) +
        trailingNewLine
      )
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

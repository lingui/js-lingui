import type { CatalogFormat, CatalogFormatOptions } from "@lingui/conf"
import type { CatalogType } from "../types"

const formats: Record<CatalogFormat, () => CatalogFormatter> = {
  lingui: () => require("./lingui").default,
  minimal: () => require("./minimal").default,
  po: () => require("./po").default,
  csv: () => require("./csv").default,
  "po-gettext": () => require("./po-gettext").default,
}

/**
 * @internal
 */
export type CatalogFormatOptionsInternal = {
  locale?: string
} & CatalogFormatOptions

export type CatalogFormatter = {
  catalogExtension: string
  /**
   * Set extension used when extract to template
   * Omit if the extension is the same as catalogExtension
   */
  templateExtension?: string
  write(
    filename: string,
    catalog: CatalogType,
    options?: CatalogFormatOptionsInternal
  ): void
  read(filename: string): CatalogType | null
  parse(content: unknown): CatalogType | null
}

export function getFormat(name: CatalogFormat): CatalogFormatter {
  const format = formats[name]

  if (!format) {
    throw new Error(
      `Unknown format "${name}". Use one of following: ${Object.keys(
        formats
      ).join(", ")}`
    )
  }

  return format()
}

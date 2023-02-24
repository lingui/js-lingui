import { CatalogFormat, CatalogFormatOptions } from "@lingui/conf"

import { CatalogType } from "../types"
import csv from "./csv"
import lingui from "./lingui"
import minimal from "./minimal"
import po from "./po"
import poGettext from "./po-gettext"

const formats: Record<CatalogFormat, CatalogFormatter> = {
  lingui,
  minimal,
  po,
  csv,
  "po-gettext": poGettext,
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

  return format
}

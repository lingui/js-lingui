import { CatalogFormat, CatalogFormatOptions } from "@lingui/conf"

import { CatalogType } from "../catalog"
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

type CatalogFormatOptionsInternal = {
  locale: string
} & CatalogFormatOptions

export type CatalogFormatter = {
  catalogExtension: string
  write(
    filename: string,
    catalog: CatalogType,
    options?: CatalogFormatOptionsInternal
  ): void
  read(filename: string): CatalogType | null
  parse(content): any
}

export default function getFormat(name: CatalogFormat): CatalogFormatter {
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

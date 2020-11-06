import { CatalogFormat } from "@lingui/conf"

import csv from "./csv"
import lingui from "./lingui"
import minimal from "./minimal"
import po from "./po"
import poGettext from "./po-gettext"
import { CatalogFormatter } from "./types"

const formats: Record<CatalogFormat, CatalogFormatter> = {
  lingui,
  minimal,
  po,
  csv,
  "po-gettext": poGettext
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

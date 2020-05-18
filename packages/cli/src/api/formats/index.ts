import lingui from "./lingui"
import minimal from "./minimal"
import po from "./po"
import csv from "./csv"
import { CatalogType } from "../types"

const formats: { [key: string]: CatalogFormat } = { lingui, minimal, po, csv }

export type CatalogFormatOptions = {
  locale: string
  origins: false
}

export type CatalogFormat = {
  catalogExtension: string
  write(
    filename: string,
    catalog: CatalogType,
    options: CatalogFormatOptions
  ): void
  read(filename: string): void
}

export default function getFormat(name: keyof typeof formats) {
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

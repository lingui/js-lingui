import lingui from "./lingui"
import minimal from "./minimal"
import po from "./po"
import { CatalogType } from "../types"

const formats: Record<string, CatalogFormatter> = { lingui, minimal, po }

export type CatalogFormat = keyof typeof formats

export interface CatalogFormatOptions {
  origins?: boolean
}

export interface CatalogFormatOptionsInternal extends CatalogFormatOptions {
  locale: string
}

export interface CatalogFormatter {
  catalogExtension: string
  write(
    filename: string,
    catalog: CatalogType,
    options: CatalogFormatOptionsInternal
  ): void
  read(filename: string): CatalogType | null
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

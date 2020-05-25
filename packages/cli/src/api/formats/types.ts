import { CatalogFormatOptions } from "@lingui/conf"
import { CatalogType } from "../types"

export type CatalogFormatOptions = {
  origins?: boolean
}

export type CatalogFormatOptionsInternal = {
  locale: string
} & CatalogFormatOptions

export type CatalogFormatter = {
  catalogExtension: string
  write(
    filename: string,
    catalog: CatalogType,
    options: CatalogFormatOptionsInternal
  ): void
  read(filename: string): CatalogType | null
}

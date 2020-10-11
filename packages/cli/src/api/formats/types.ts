import { CatalogFormatOptions } from "@lingui/conf"
import { CatalogType } from "../types"

export type CatalogFormatOptionsInternal = {
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
}

import { CatalogFormatOptions } from "@lingui/conf"

import { CatalogType } from "../types"

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

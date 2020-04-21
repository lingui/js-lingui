import lingui from "./lingui"
import minimal from "./minimal"
import po from "./po"
import { CatalogFormatter, CatalogFormatOptions } from "./types"

export { CatalogFormatter, CatalogFormatOptions }

const formats: Record<string, CatalogFormatter> = { lingui, minimal, po }

export type CatalogFormat = keyof typeof formats

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

import type { CatalogFormat, CatalogFormatter } from "@lingui/conf"
import { CatalogFormatOptions } from "@lingui/conf"

const formats: Record<
  CatalogFormat,
  () => (options: CatalogFormatOptions) => CatalogFormatter
> = {
  lingui: () => require("./lingui").default,
  minimal: () => require("./minimal").default,
  po: () => require("./po").default,
  csv: () => require("./csv").default,
  "po-gettext": () => require("./po-gettext").default,
}

export function getFormat(
  _format: CatalogFormat | CatalogFormatter,
  options: CatalogFormatOptions
): CatalogFormatter {
  if (typeof _format !== "string") {
    return _format
  }

  const format = formats[_format]

  if (!format) {
    throw new Error(
      `Unknown format "${_format}". Use one of following: ${Object.keys(
        formats
      ).join(", ")}`
    )
  }

  return format()(options)
}

import type { CatalogFormat, CatalogFormatter } from "@lingui/conf"
import { CatalogFormatOptions } from "@lingui/conf"
import { FormatterWrapper } from "./api/formatterWrapper"

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

export { FormatterWrapper }

export function getFormat(
  _format: CatalogFormat | CatalogFormatter,
  options: CatalogFormatOptions
): FormatterWrapper {
  if (typeof _format !== "string") {
    return new FormatterWrapper(_format)
  }

  const format = formats[_format]

  if (!format) {
    throw new Error(
      `Unknown format "${_format}". Use one of following: ${Object.keys(
        formats
      ).join(", ")}`
    )
  }

  return new FormatterWrapper(format()(options))
}

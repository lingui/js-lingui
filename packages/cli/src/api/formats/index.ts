import type { CatalogFormat, CatalogFormatter } from "@lingui/conf"
import { CatalogFormatOptions } from "@lingui/conf"
import { FormatterWrapper } from "./api/formatterWrapper"

type CatalogFormatterFactoryFn = (options: any) => CatalogFormatter

const formats: Record<CatalogFormat, () => Promise<CatalogFormatterFactoryFn>> =
  {
    lingui: async () => (await import("./lingui")).default,
    minimal: async () => (await import("./minimal")).default,
    po: async () => (await import("./po")).default,
    csv: async () => (await import("./csv")).default,
    "po-gettext": async () => (await import("./po-gettext")).default,
  }

export { FormatterWrapper }

export async function getFormat(
  _format: CatalogFormat | CatalogFormatter,
  options: CatalogFormatOptions
): Promise<FormatterWrapper> {
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

  return new FormatterWrapper((await format())(options))
}

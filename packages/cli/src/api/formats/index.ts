import type { CatalogFormatter } from "@lingui/conf"
import { FormatterWrapper } from "./formatterWrapper.js"

export { FormatterWrapper }

export async function getFormat(
  format: CatalogFormatter | undefined,
  sourceLocale: string,
): Promise<FormatterWrapper> {
  if (!format) {
    format = (await import("@lingui/format-po")).formatter()
  }
  return new FormatterWrapper(format, sourceLocale)
}

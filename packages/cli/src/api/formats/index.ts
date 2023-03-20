import type { CatalogFormat, CatalogFormatter } from "@lingui/conf"
import { CatalogFormatOptions } from "@lingui/conf"
import { FormatterWrapper } from "./formatterWrapper"
import { makeInstall } from "../utils"

type CatalogFormatterFactoryFn = (options: any) => CatalogFormatter

function createDeprecationError(
  packageName: string,
  format: string,
  installCode: string
) {
  const installCmd = makeInstall(packageName)

  return `
Format \`${format}\` is no longer included in \`@lingui/cli\` by default.
You need to install it using ${installCmd} command and add to your \`lingui.config.{js,ts}\`:
        
import { formatter } from "${packageName}"

export default {
  [...]
  format: ${installCode}
}
`.trim()
}

// Introduced in v4. Remove this deprecation in v5
const formats: Record<CatalogFormat, () => Promise<CatalogFormatterFactoryFn>> =
  {
    lingui: async () => {
      throw new Error(
        createDeprecationError(
          "@lingui/format-json",
          "lingui",
          'formatter({style: "lingui"})'
        )
      )
    },
    minimal: async () => {
      throw new Error(
        createDeprecationError(
          "@lingui/format-json",
          "minimal",
          'formatter({style: "minimal"})'
        )
      )
    },
    po: async () => (await import("@lingui/format-po")).formatter,
    csv: async () => {
      throw new Error(
        createDeprecationError("@lingui/format-csv", "csv", "formatter()")
      )
    },
    "po-gettext": async () => {
      throw new Error(
        createDeprecationError(
          "@lingui/format-po-gettext",
          "po-gettext",
          "formatter()"
        )
      )
    },
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

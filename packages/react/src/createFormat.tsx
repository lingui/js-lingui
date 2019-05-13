import * as React from "react"

import { Locales } from "@lingui/core"
import { useLingui } from "@lingui/react"

type FormatProps<V, FormatOptions> = {
  value: V
  format?: FormatOptions
}

function createFormat<V, FormatOptions>(
  formatFunction: (
    locale: Locales,
    format?: FormatOptions
  ) => (value: V) => string
): React.ElementType<FormatProps<V, FormatOptions>> {
  // @ts-ignore: React types doens't support string as a component return type
  return function({ value, format }) {
    const { i18n } = useLingui()
    const formatter = formatFunction(i18n.locales || i18n.locale, format)
    return formatter(value)
  }
}

export default createFormat

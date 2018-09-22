// @flow
import * as React from "react"

import type { Locales, I18n } from "@lingui/core"
import withI18n from "./withI18n"

type FormatProps<V, FormatOptions> = {
  value: V,
  format?: FormatOptions,
  i18n: I18n
}

function createFormat<V, FormatOptions>(
  formatFunction: (
    locale: Locales,
    format?: FormatOptions
  ) => (value: V) => string
) {
  return withI18n(function({
    value,
    format,
    i18n
  }: FormatProps<V, FormatOptions>) {
    const formatter = formatFunction(i18n.locales || i18n.language, format)
    return formatter(value)
  })
}

export default createFormat

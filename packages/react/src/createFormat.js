// @flow
import * as React from "react"

import type { Locales } from "@lingui/core"
import { I18n } from "@lingui/react"

type FormatProps<V, FormatOptions> = {
  value: V,
  format?: FormatOptions
}

function createFormat<V, FormatOptions>(
  formatFunction: (
    locale: Locales,
    format?: FormatOptions
  ) => (value: V) => string
) {
  return function({ value, format }: FormatProps<V, FormatOptions>) {
    return (
      <I18n>
        {({ i18n }) => {
          const formatter = formatFunction(i18n.locales || i18n.locale, format)
          return formatter(value)
        }}
      </I18n>
    )
  }
}

export default createFormat

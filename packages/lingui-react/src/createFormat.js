// @flow
import React from "react"

import type { RenderProps } from "./Render"
import Render from "./Render"

type FormatProps<V, FormatOptions> = {
  value: V,
  format?: FormatOptions,
  i18n: {
    language: string
  }
} & RenderProps

function createFormat<V, FormatOptions>(
  formatFunction: (
    language: string,
    format?: FormatOptions
  ) => (value: V) => string
) {
  return function({
    value,
    format,
    i18n,
    className,
    render
  }: FormatProps<V, FormatOptions>) {
    const formatter = formatFunction(i18n.language, format)
    return (
      <Render className={className} render={render} value={formatter(value)} />
    )
  }
}

export default createFormat

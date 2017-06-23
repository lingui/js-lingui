// @flow
import React from 'react'

import type { RenderProps } from './Render'
import Render from './Render'

type FormatProps<V, FormatOptions> = {
  value: V,
  format?: FormatOptions,
  i18n: {
    language: string
  }
} & RenderProps

function createFormat<V, FormatOptions, P: FormatProps<V, FormatOptions>> (formatFunction: (language: string, format?: FormatOptions) => (value: V) => string): Class<React$Component<void, P, void>> {
  return function ({ value, format, i18n, className, render }: FormatProps<V, FormatOptions>) {
    const formatter = formatFunction(i18n.language, format)
    return <Render className={className} render={render}>{formatter(value)}</Render>
  }
}

export default createFormat

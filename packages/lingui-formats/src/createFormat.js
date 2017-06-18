// @flow
import React from 'react'

type FormatProps<V, FormatOptions> = {
  value: V,
  format?: FormatOptions,
  i18n: {
    language: string
  }
}

function
createFormat<V, FormatOptions, P: FormatProps<V, FormatOptions>>
(formatFunction: (language: string, format?: FormatOptions) => (value: V) => string): Class<React$Component<void, P, void>> {
  console.warn('DEPRECATED (removal in 1.x): createFormat was moved to lingui-react package')

  return class extends React.Component {
    props: P

    render () {
      const { value, format, i18n } = this.props
      const formatter = formatFunction(i18n.language, format)
      return <span>{formatter(value)}</span>
    }
  }
}

/**
 * Remove in 1.x
 * This is only used to hide deprecation warning when including inside this
 * library.
 */
function
silentCreateFormat<V, FormatOptions, P: FormatProps<V, FormatOptions>>
(formatFunction: (language: string, format?: FormatOptions) => (value: V) => string): Class<React$Component<void, P, void>> {
return class extends React.Component {
  props: P

  render () {
    const { value, format, i18n } = this.props
    const formatter = formatFunction(i18n.language, format)
    return <span>{formatter(value)}</span>
  }
}
}

export default createFormat
export { silentCreateFormat }

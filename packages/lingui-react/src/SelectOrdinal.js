// @flow
import React from 'react'
import WithI18n from './WithI18n'
import type { PluralProps } from './Plural'

import type { RenderProps } from './Render'
import Render from './Render'

type SelectOrdinalProps = PluralProps & RenderProps

class SelectOrdinal extends React.Component<*, SelectOrdinalProps, *> {
  props: SelectOrdinalProps

  static defaultProps = {
    offset: 0
  }

  render () {
    const { value, offset, i18n } = this.props

    const n = parseInt(value) - parseInt(offset)
    const form = i18n.pluralForm(n, 'ordinal') || 'other'
    const translation = (this.props[`_${n}`] || this.props[form]).replace('#', n)

    const { className, render } = this.props
    return <Render className={className} render={render}>{translation}</Render>
  }
}

export default WithI18n()(SelectOrdinal)

// @flow
import React from 'react'
import WithI18n from './WithI18n'
import type { WithI18nProps } from './WithI18n'

import type { RenderProps } from './Render'
import Render from './Render'

type PluralProps = {
  value: number | string,
  offset?: number | string,
  zero?: any,
  one?: any,
  two?: any,
  few?: any,
  many?: any,
  other: any,
} & WithI18nProps & RenderProps

class Plural extends React.Component<*, PluralProps, *> {
  props: PluralProps

  static defaultProps = {
    offset: 0
  }

  render () {
    const {
      value, offset, i18n
    } = this.props

    const n = parseInt(value) - parseInt(offset)
    const form = i18n.pluralForm(n)
    const translation = (this.props[`_${value}`] || this.props[form]).replace('#', n)

    const { className, render } = this.props
    return <Render className={className} render={render}>{translation}</Render>
  }
}

export default WithI18n()(Plural)
export type { PluralProps }

// @flow
import React from 'react'
import WithI18n from './WithI18n'
import type { WithI18nProps } from './WithI18n'
import rules from './plurals'

type PluralProps = {
  value: number | string,
  offset?: number | string,
  zero?: any,
  one?: any,
  two?: any,
  few?: any,
  many?: any,
  other: any
} & WithI18nProps

class Plural extends React.Component<*, PluralProps, *> {
  props: PluralProps

  static defaultProps = {
    offset: 0
  }

  render () {
    const {
      value, offset,
      i18n: { language }
    } = this.props

    const n = parseInt(value) - parseInt(offset)
    const form = rules[language].cardinal(n)
    const translation = this.props[`_${value}`] || this.props[form]

    return <span>{translation.replace('#', n)}</span>
  }
}

export default WithI18n()(Plural)

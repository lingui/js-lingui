import React from 'react'
import WithI18n from './WithI18n'
import type { I18nProps } from './I18nProvider'
import rules from './plurals'

type PluralProps = {
  value: number,
  offset?: number,
  zero?: any,
  one?: any,
  two?: any,
  few?: any,
  many?: any,
  other?: any
} & I18nProps

class Plural extends React.Component {
  props: PluralProps

  render () {
    const {
      value, offset,
      i18n: { language }
    } = this.props

    const form = rules[language].cardinal(value - offset)
    const translation = this.props[`_${value}`] || this.props[form]

    return <span>{translation.replace('#', value - offset)}</span>
  }
}

Plural.defaultProps = {
  offset: 0
}

export default WithI18n()(Plural)

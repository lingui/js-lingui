// @flow
import React from 'react'
import WithI18n from './WithI18n'
import type { PluralProps } from './Plural'
import rules from './plurals'

type SelectOrdinalProps = PluralProps

class SelectOrdinal extends React.Component<*, SelectOrdinalProps, *> {
  props: SelectOrdinalProps

  static defaultProps = {
    offset: 0
  }

  render () {
    const {
      value, offset, other,
      i18n: { language }
    } = this.props

    const n = parseInt(value) - parseInt(offset)
    const ordinalRules = rules[language].ordinal || rules[language].cardinal
    const form = ordinalRules(n)
    const translation = this.props[`_${n}`] || this.props[form] || other

    return <span>{translation.replace('#', n)}</span>
  }
}

export default WithI18n()(SelectOrdinal)

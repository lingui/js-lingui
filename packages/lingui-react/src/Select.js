// @flow
import React from 'react'

type SelectProps = {
  value: any,
  other: any
}

class Select extends React.Component<*, SelectProps, *> {
  props: SelectProps

  render () {
    const {
      value, other
    } = this.props

    const translation = this.props[value] || other
    return <span>{translation}</span>
  }
}

export default Select

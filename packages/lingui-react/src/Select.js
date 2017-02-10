import React from 'react'

type SelectProps = {
  value: number,
  other: React$Element<any>
}

class Select extends React.Component {
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

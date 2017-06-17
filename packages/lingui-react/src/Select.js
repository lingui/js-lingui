// @flow
import React from 'react'

import type { RenderProps } from './Render'
import Render from './Render'

type SelectProps = {
  value: any,
  other: any,
} & RenderProps

class Select extends React.Component<*, SelectProps, *> {
  props: SelectProps

  render () {
    const { value, other } = this.props
    const translation = this.props[value] || other

    const { className, render } = this.props
    return <Render className={className} render={render}>{translation}</Render>
  }
}

export default Select

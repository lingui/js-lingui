// @flow
import React from 'react'
import PropTypes from 'prop-types'

export type RenderProps = {
  render?: any,
  className?: string
}

type RenderComponentProps = {
  value: string | Array<any>
} & RenderProps

export default class Render extends React.Component<RenderComponentProps> {
  props: RenderComponentProps

  static contextTypes = {
    linguiDefaultRender: PropTypes.any
  }

  render () {
    const { className, value } = this.props
    const render = this.props.render || this.context.linguiDefaultRender || 'span'

    // Built-in element: h1, p
    if (typeof render === 'string') {
      return React.createElement(render, { className }, value)
    }

    return React.isValidElement(render)
      // Custom element: <p className="lear' />
      ? React.cloneElement(render, {}, value)
      // Custom component: ({ translation }) => <a title={translation}>x</a>
      : React.createElement(render, { translation: value })
  }
}

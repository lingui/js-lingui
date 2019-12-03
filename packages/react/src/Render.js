// @flow
import * as React from "react"
import PropTypes from "prop-types"

const REACT_VERSION = React.version

export type RenderProps = {
  render?: any,
  className?: string
}

type RenderComponentProps = {
  value: string | ?Array<any>
} & RenderProps

export default class Render extends React.Component<RenderComponentProps> {
  props: RenderComponentProps

  static contextTypes = {
    linguiDefaultRender: PropTypes.any
  }

  render() {
    const { className, value } = this.props
    let render = this.props.render || this.context.linguiDefaultRender

    if (render === null || render === undefined) {
      if (process.env.NODE_ENV !== "production" && typeof value === "string") {
        if (/^15\./.test(REACT_VERSION)) {
          console.warn(
            "lingui is about to return a string from render() in React 15.x, " +
              "which will likely raise an Uncaught Invariant Violation error. " +
              "to resolve this, please provide a custom defaultRender function " +
              "that wraps the string in a component of your choice, or upgrade " +
              "to React 16."
          )
        }
      }
      return value || null
    } else if (typeof render === "string") {
      // Built-in element: h1, p
      return React.createElement(render, { className }, value)
    }

    return React.isValidElement(render)
      ? // Custom element: <p className="lear' />
        React.cloneElement(render, {}, value)
      : // Custom component: ({ translation }) => <a title={translation}>x</a>
        React.createElement(render, { translation: value })
  }
}

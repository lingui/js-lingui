// @flow
import React from 'react'

export type RenderProps = {
  render?: any,
  className?: string
}

type RenderComponentProps = {
  value: string | Array<any>
} & RenderProps

const Render = ({ render = 'span', className, value }: RenderComponentProps) => {
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

export default Render

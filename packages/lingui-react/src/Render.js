// @flow
import React from 'react'

export type RenderProps = {
  render?: any,
  className?: string
}

type RenderComponentProps = {
  children: string
} & RenderProps

const Render = ({ render, className, children }: RenderComponentProps) => {
  if (render) {
    // Built-in element: h1, p
    if (typeof render === 'string') {
      return React.createElement(render, {}, children)
    }

    return React.isValidElement(render)
      // Custom element: <p className="lear' />
      ? React.cloneElement(render, {}, children)
      // Custom component: ({ translation }) => <a title={translation}>x</a>
      : React.createElement(render, { translation: children })
  }

  return <span className={className}>{children}</span>
}

export default Render

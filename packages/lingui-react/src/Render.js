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
    return React.isValidElement(render)
      ? React.cloneElement(render, {}, children)
      : React.createElement(render, { translation: children })
  }

  return <span className={className}>{children}</span>
}

export default Render

// @flow
import React from 'react'

export type RenderProps = {
  render?: Function | React$Element<*> | ReactClass<*>,
  className?: string
}

type RenderComponentProps = {
  children: string
} & RenderProps

const Render = ({ render, className, children }: RenderComponentProps) => {
  if (render) {
    return React.isValidElement(render)
      // $FlowIgnore: Don't know how to handle this type union
      ? React.cloneElement(render, {}, children)
      // $FlowIgnore: Don't know how to handle this type union
      : React.createElement(render, { translation: children })
  }

  return <span className={className}>{children}</span>
}

export default Render

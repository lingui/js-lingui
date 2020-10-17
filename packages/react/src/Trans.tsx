import React, { DOMElement } from "react"

import { useLingui } from "./I18nProvider"
import { formatElements } from "./format"

export type TransRenderProps = {
  id: string
  translation: React.ReactNode
  message: string | null
}

export type TransRenderType =
  string |
  DOMElement<any, any> |
  React.ReactElement<TransRenderProps> |
  React.FunctionComponent<TransRenderProps> |
  ((o: TransRenderProps) => TransRenderType);

export type TransRenderPropsType = TransRenderType & React.ComponentClass<TransRenderProps>

export type TransProps = {
  id: string
  message?: string
  values: Object
  components: { [key: string]: React.ElementType | any }
  formats?: Object
  render?: TransRenderPropsType
}

export function Trans(props: TransProps) {
  const { i18n, defaultRender } = useLingui()
  const { render = defaultRender, id, message, formats } = props

  const values = { ...props.values }
  const components = { ...props.components }

  if (values) {
    /*
      Related discussion: https://github.com/lingui/js-lingui/issues/183

      Values *might* contain React elements with static content.
      They're replaced with <INDEX /> placeholders and added to `components`.

      Example:
      Translation: Hello {name}
      Values: { name: <strong>Jane</strong> }

      It'll become "Hello <0 />" with components=[<strong>Jane</strong>]
      */

    Object.keys(values).forEach((key) => {
      const value = values[key]
      if (!React.isValidElement(value)) return

      const index = Object.keys(components).length

      components[index] = value
      values[key] = `<${index}/>`
    })
  }

  const _translation =
    i18n && typeof i18n._ === "function"
      ? i18n._(id, values, { message, formats })
      : id // i18n provider isn't loaded at all

  const translation = _translation
    ? formatElements(_translation, components)
    : null

  if (render === null || render === undefined) {
    return <>{translation}</>
  } else if (typeof render === "string") {
    // Built-in element: h1, p
    return React.createElement(render, {}, translation)
  } else if (isClassComponent(render as TransRenderPropsType) || isFunctionalComponent(render)) {
    // We apply the logic of React of:
    // - Don't call function components. Render them.
    // If we just use render(), as functional component,
    // will "work" but not the way you'd expect and it could behave in unexpected ways as you make changes
    return React.createElement(render as React.ElementType<TransRenderProps>, {
      id,
      translation,
      message
    })
  } else if (React.isValidElement(render)) {
    // Element: <p className="lear' />
    return React.cloneElement(render, {}, translation)
  }

  // Component: (props) => <a title={props.translation}>x</a>
  return render({
    id,
    translation,
    message,
  })
}

export function isClassComponent(Component: React.ComponentClass) {
  return !!(
    typeof Component === 'function'
    && Component.prototype?.isReactComponent
  );
}

export function isFunctionalComponent(Component: TransRenderType) {
  return (
    typeof Component === 'function'
    && !Component.prototype?.isReactComponent
  );
}

Trans.defaultProps = {
  values: {},
  components: {},
}

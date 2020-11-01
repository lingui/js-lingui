import React from "react"

import { useLingui } from "./I18nProvider"
import { formatElements } from "./format"

export type TransRenderProps = {
  id?: string
  translation?: React.ReactNode
  children?: string | any[] | React.ReactNode
  message?: string | null
}

export type TransProps = {
  id: string
  message?: string
  values: Object
  components: { [key: string]: React.ElementType | any }
  formats?: Object
  component?: React.ComponentType<TransRenderProps>
  render?: (props: TransRenderProps) => React.ReactElement<any, any> | null
}

export function Trans(props: TransProps): React.ReactElement<any, any> | null {
  const { i18n, defaultComponent } = useLingui()
  const { render, component, id, message, formats } = props

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

  const _translation: string =
    i18n && typeof i18n._ === "function"
      ? i18n._(id, values, { message, formats })
      : id // i18n provider isn't loaded at all

  const translation = _translation
    ? formatElements(_translation, components)
    : null

  if (render === null || component === null) {
    // Although `string` is a valid react element, types only allow `Element`
    // Upstream issue: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20544
    return (translation as unknown) as React.ReactElement<any, any>
  }

  const FallbackComponent = (defaultComponent ||
    React.Fragment) as React.ComponentType<any>

  // Validation of `render` and `component` props
  if (render && component) {
    console.error(
      "You can't use both `component` and `render` prop at the same time. `component` is ignored."
    )
  } else if (render && typeof render !== "function") {
    console.error(
      `Invalid value supplied to prop \`render\`. It must be a function, provided ${render}`
    )
  } else if (component && typeof component !== "function") {
    // Apparently, both function components and class components are functions
    // See https://stackoverflow.com/a/41658173/1535540
    console.error(
      `Invalid value supplied to prop \`component\`. It must be a React component, provided ${component}`
    )
    return <FallbackComponent>{translation}</FallbackComponent>
  }

  // Rendering using a render prop
  if (typeof render === "function") {
    // Component: render={(props) => <a title={props.translation}>x</a>}
    return render({
      id,
      translation,
      message,
    })
  }

  // `component` prop has a higher precedence over `defaultComponent`
  const Component = (component || FallbackComponent) as React.ComponentType<any>
  return <Component>{translation}</Component>
}

Trans.defaultProps = {
  values: {},
  components: {},
}

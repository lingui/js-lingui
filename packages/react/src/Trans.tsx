import React from "react"

import { useLingui } from "./I18nProvider"
import { formatElements } from "./format"

export type TransRenderProps = {
  id?: string
  translation?: React.ReactNode
  children?: string | any[] | React.ReactNode
  message?: string | null
}

export type TransRenderType = React.ComponentType<TransRenderProps> | React.ElementType<TransRenderProps>;

export type TransProps = {
  id: string
  message?: string
  values: Object
  components: { [key: string]: React.ElementType | any }
  formats?: Object
  component?: TransRenderType
  render?: (opts: TransRenderProps) => TransRenderType
}

export function Trans(props: TransProps) {
  const { i18n, defaultComponent: DefaultComponent } = useLingui()
  const { render, component: Component, id, message, formats } = props

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

  const fallback = DefaultComponent ? <DefaultComponent>{translation}</DefaultComponent> : <>{translation}</>;

  if (typeof render === "string" || typeof Component === "string") {
    console.error(`Invalid prop 'component' supplied to '<Trans />': the prop is not a valid React component`)
    return fallback
  }

  if (render && Component) {
    console.error("You can't use 'component' prop at the same time of 'render', we encourage the use of 'component' prop")
    return fallback
  }

  if (render && typeof render === "function") {
    // Component: render={(props) => <a title={props.translation}>x</a>}
    return render({
      id,
      translation,
      message,
    });
  } else if (Component) {
    // Component: component={Text}
    return <Component>{translation}</Component>;
  } else {
    return fallback
  }
}

Trans.defaultProps = {
  values: {},
  components: {},
}

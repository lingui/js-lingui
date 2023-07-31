import React, { ComponentType } from "react"

import { useLingui } from "./I18nProvider"
import { formatElements } from "./format"
import type { MessageOptions } from "@lingui/core"
import { I18n } from "@lingui/core"

export type TransRenderProps = {
  id: string
  translation: React.ReactNode
  children: React.ReactNode
  message?: string | null
  isTranslated: boolean
}

export type TransRenderCallbackOrComponent =
  | {
      component?: undefined
      render?:
        | ((props: TransRenderProps) => React.ReactElement<any, any>)
        | null
    }
  | {
      component?: React.ComponentType<TransRenderProps> | null
      render?: undefined
    }

export type TransProps = {
  id: string
  message?: string
  values?: Record<string, unknown>
  components?: { [key: string]: React.ElementType | any }
  formats?: MessageOptions["formats"]
  comment?: string
  children?: React.ReactNode
} & TransRenderCallbackOrComponent

export function Trans(props: TransProps): React.ReactElement<any, any> | null {
  const lingui = useLingui()
  return React.createElement(TransNoContext, { ...props, lingui })
}

export function TransNoContext(
  props: TransProps & {
    lingui: { i18n: I18n; defaultComponent?: ComponentType<TransRenderProps> }
  }
): React.ReactElement<any, any> | null {
  const {
    render,
    component,
    id,
    message,
    formats,
    lingui: { i18n, defaultComponent },
  } = props

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
      const valueIsReactEl =
        React.isValidElement(value) ||
        (Array.isArray(value) && value.every(React.isValidElement))
      if (!valueIsReactEl) return

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
    return translation as unknown as React.ReactElement<any, any>
  }

  const FallbackComponent: React.ComponentType<TransRenderProps> =
    defaultComponent || RenderFragment

  const i18nProps: TransRenderProps = {
    id,
    message,
    translation,
    isTranslated: id !== translation && message !== translation,
    children: translation, // for type-compatibility with `component` prop
  }

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
    return React.createElement(FallbackComponent, i18nProps, translation)
  }

  // Rendering using a render prop
  if (typeof render === "function") {
    // Component: render={(props) => <a title={props.translation}>x</a>}
    return render(i18nProps)
  }

  // `component` prop has a higher precedence over `defaultComponent`
  const Component: React.ComponentType<TransRenderProps> =
    component || FallbackComponent

  return React.createElement(Component, i18nProps, translation)
}

const RenderFragment = ({ children }: TransRenderProps) => {
  // cannot use React.Fragment directly because we're passing in props that it doesn't support
  return <React.Fragment>{children}</React.Fragment>
}

import * as React from "react"

import { useLingui } from "./I18nProvider"
import { formatElements } from "./format"

export type TransRenderType = string | React.ElementType | React.ReactElement

export interface TransProps {
  id: string
  message?: string
  values: Object
  components: {[key: string]: React.ElementType | any}
  formats?: Object
  render?: TransRenderType
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

    Object.keys(values).forEach(key => {
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
    return translation
  } else if (typeof render === "string") {
    // Built-in element: h1, p
    return React.createElement(render, {}, translation)
  } else if (typeof render === "function") {
    // Function: (props) => <a title={props.translation}>x</a>
    return render({ id, translation, message })
  }

  // Element: <p className="lear' />
  return React.cloneElement(render, {}, translation)
}

Trans.defaultProps = {
  values: {},
  components: {}
}

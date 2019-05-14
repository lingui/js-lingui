import * as React from "react"

import { useLingui } from "./I18nProvider"
import { formatElements } from "./format"

export interface TransProps {
  id: string
  defaults?: string
  values?: Object
  formats?: Object
  components?: Array<React.ElementType | any>
  render?: string | React.ElementType | React.ReactElement
}

export function Trans(props: TransProps) {
  const { i18n, defaultRender } = useLingui()
  const { render = defaultRender, id, defaults, formats } = props

  const values = { ...props.values }
  const components = props.components ? [...props.components] : []

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

      const index = components.push(value) - 1 // push returns new length of array
      values[key] = `<${index}/>`
    })
  }

  const _translation =
    i18n && typeof i18n._ === "function"
      ? i18n._(id, values, { defaults, formats })
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
    return render({ id, translation, defaults })
  }

  // Element: <p className="lear' />
  return React.cloneElement(render, {}, translation)
}

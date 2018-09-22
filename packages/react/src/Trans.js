// @flow
import * as React from "react"

import type { I18n } from "@lingui/core"
import { formatElements } from "./format"
import { I18nDefaultRenderConsumer, I18nCoreConsumer } from "./I18nProvider"

export type TransProps = {
  id: string,
  defaults?: string,
  values?: Object,
  formats?: Object,
  components?: Array<React.Element<*>>,
  render?: string | Function | React.Element<*>
}

export default class Trans extends React.Component<TransProps> {
  getTranslation(i18n: I18n): React.Node {
    const { id = "", defaults, formats } = this.props

    const values = { ...this.props.values }
    const components = this.props.components ? [...this.props.components] : []

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

    const translation =
      i18n && typeof i18n._ === "function"
        ? i18n._(id, values, { defaults, formats })
        : id // i18n provider isn't loaded at all
    if (!translation) return null

    return formatElements(translation, components)
  }

  render() {
    return (
      <I18nCoreConsumer>
        {i18n => {
          const translation = this.getTranslation(i18n)
          return (
            <I18nDefaultRenderConsumer>
              {defaultRender => {
                const { render = defaultRender, id, defaults } = this.props

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
              }}
            </I18nDefaultRenderConsumer>
          )
        }}
      </I18nCoreConsumer>
    )
  }
}

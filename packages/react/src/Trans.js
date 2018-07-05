// @flow
import * as React from "react"

import withI18n from "./withI18n"
import type { withI18nProps } from "./withI18n"
import { formatElements } from "./format"

import type { RenderProps } from "./Render"
import Render from "./Render"

type TransProps = {
  id?: string,
  defaults?: string,
  values?: Object,
  formats?: Object,
  components?: Array<React$Element<*>>,
  i18n: Object,
  children?: any
} & withI18nProps &
  RenderProps

class Trans extends React.Component<TransProps> {
  props: TransProps

  componentDidMount() {
    if (process.env.NODE_ENV !== "production") {
      if (!this.getTranslation() && this.props.children) {
        console.warn(
          "@lingui/babel-preset-react is probably missing in babel config, " +
            "but you are using <Trans> component in a way which requires it. " +
            "Either don' use children in <Trans> component or configure babel " +
            "to load @lingui/babel-preset-react preset. See tutorial for more info: " +
            "https://l.lingui.io/tutorial-i18n-react"
        )
      }
    }
  }

  getTranslation(): string | ?Array<any> {
    const { id = "", defaults, i18n, formats } = this.props

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
      <Render
        render={this.props.render}
        className={this.props.className}
        value={this.getTranslation()}
      />
    )
  }
}

export default withI18n()(Trans)

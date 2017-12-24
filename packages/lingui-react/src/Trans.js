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
          "lingui-react preset is probably missing in babel config, " +
            "but you are using <Trans> component in a way which requires it. " +
            "Either don' use children in <Trans> component or configure babel " +
            "to load lingui-react preset. See tutorial for more info: " +
            "https://l.lingui.io/tutorial-i18n-react"
        )
      }
    }
  }

  getTranslation(): string {
    const { id = "", defaults, i18n, values, formats } = this.props
    return i18n && typeof i18n._ === "function"
      ? i18n._(id, values, { defaults, formats })
      : // i18n provider isn't loaded at all
        id
  }

  render() {
    const translation = formatElements(
      this.getTranslation(),
      this.props.components
    )
    return (
      <Render
        render={this.props.render}
        className={this.props.className}
        value={translation}
      />
    )
  }
}

export default withI18n()(Trans)

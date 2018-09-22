// @flow
import * as React from "react"
import type { I18n } from "@lingui/core"

export const {
  Provider: I18nCoreProvider,
  Consumer: I18nCoreConsumer
} = React.createContext({})
export const {
  Provider: I18nDefaultRenderProvider,
  Consumer: I18nDefaultRenderConsumer
} = React.createContext(null)

export type I18nProviderProps = {
  i18n: I18n,
  children: any,
  defaultRender?: any
}

export type I18nProviderState = {
  i18n: I18n
}

export default class I18nProvider extends React.Component<
  I18nProviderProps,
  I18nProviderState
> {
  unsubscribe: Function

  constructor(props: I18nProviderProps) {
    super(props)
    this.state = {
      i18n: this.props.i18n
    }
  }

  componentDidMount() {
    this.unsubscribe = this.props.i18n.onActivate(this.localeChanged)
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  localeChanged = () => {
    const i18n = Object.assign(
      Object.create(Object.getPrototypeOf(this.props.i18n)),
      this.props.i18n
    )
    this.setState({ i18n })
  }

  render() {
    return (
      <I18nDefaultRenderProvider value={this.props.defaultRender}>
        <I18nCoreProvider value={this.state.i18n}>
          {this.props.children}
        </I18nCoreProvider>
      </I18nDefaultRenderProvider>
    )
  }
}

// @flow
import * as React from "react"
import type { I18n as I18nType } from "@lingui/core"

type I18nProviderProps = {
  i18n: I18nType,
  children: any,
  defaultRender?: any
}

type I18nContext = {
  i18n: I18nType,
  defaultRender?: any
}

type I18nProviderState = {|
  context: I18nContext
|}

const { Provider: I18nContextProvider, Consumer: I18n } = React.createContext({
  i18n: {},
  defaultRender: null
})

export { I18n }

export class I18nProvider extends React.Component<
  I18nProviderProps,
  I18nProviderState
> {
  unsubscribe: Function

  constructor(props: I18nProviderProps) {
    super(props)
    this.state = this.setContext(false)
  }

  /**
   * I18n object from `@lingui/core` is the single source of truth for all i18n related
   * data (active locale, catalogs). When new messages are loaded or locale is changed
   * we need to trigger re-rendering of I18nContextConsumers.
   */
  componentDidMount() {
    this.unsubscribe = this.props.i18n.didActivate(this.setContext)
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  /**
   * We can't pass `i18n` object directly through context, because even when locale
   * or messages are changed, i18n object is still the same. Context provider compares
   * reference identity and suggested workaround is create a wrapper object every time
   * we need to trigger re-render. See https://reactjs.org/docs/context.html#caveats.
   *
   * Due to this effect we also pass `defaultRender` in the same context, instead
   * of creating a separate Provider/Consumer pair.
   *
   * When `set` is false, `setState` isn't called and new state is returned. This is
   * used in constructor when we can't call `setState`
   */
  setContext = (set: boolean = true) => {
    const state = {
      context: {
        i18n: this.props.i18n,
        defaultRender: this.props.defaultRender
      }
    }

    if (set) this.setState(state)
    return state
  }

  render() {
    const { context } = this.state
    return (
      <I18nContextProvider value={context}>
        {context.i18n.locale && this.props.children}
      </I18nContextProvider>
    )
  }
}

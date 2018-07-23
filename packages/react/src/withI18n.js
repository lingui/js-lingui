// @flow
import * as React from "react"
import PropTypes from "prop-types"
import hoistStatics from "hoist-non-react-statics"
import type { I18n } from "@lingui/core"

type withI18nOptions = {
  update?: boolean,
  withRef?: boolean,
  withHash?: boolean
}

type withI18nProps = {
  i18n: I18n
}

const withI18n = (options: withI18nOptions = {}) =>
  function<P, C: React.ComponentType<P>>(
    WrappedComponent: C
  ): C & React.ComponentType<$Diff<P, withI18nProps>> {
    if (process.env.NODE_ENV !== "production") {
      if (typeof options === "function" || React.isValidElement(options)) {
        console.warn(
          "withI18n([options]) takes options as a first argument, " +
            "but received React component itself. Without options, the Component " +
            "should be wrapped as withI18n()(Component), not withI18n(Component)."
        )
      }
    }

    const { update = true, withHash = true, withRef = false } = options

    class withI18n extends React.Component<*, *> {
      static contextTypes = {
        linguiPublisher: PropTypes.object
      }

      wrappedInstance = null

      setWrappedInstance = ref => {
        if (withRef) this.wrappedInstance = ref
      }

      getWrappedInstance = () => {
        if (!withRef) {
          throw new Error(
            "To access the wrapped instance, you need to specify { withRef: true }" +
              " in the options argument of the withI18n() call."
          )
        }

        return this.wrappedInstance
      }

      componentDidMount() {
        const { subscribe } = this.getI18n()
        if (update && subscribe) subscribe(this.checkUpdate)
      }

      componentWillUnmount() {
        const { unsubscribe } = this.getI18n()
        if (update && unsubscribe) unsubscribe(this.checkUpdate)
      }

      // Test checks that subscribe/unsubscribe is called with function.
      checkUpdate = /* istanbul ignore next */ () => {
        this.forceUpdate()
      }

      getI18n() {
        return this.context.linguiPublisher || {}
      }

      render() {
        const { i18n, i18nHash } = this.getI18n()
        const props = {
          ...this.props,
          ...(withRef ? { ref: this.setWrappedInstance } : {}),
          // Add hash of active language and active catalog, so underlying
          // PureComponent is forced to rerender.
          ...(withHash ? { i18nHash } : {})
        }
        return <WrappedComponent {...props} i18n={i18n} />
      }
    }

    return hoistStatics(withI18n, WrappedComponent)
  }

export default withI18n

export type { withI18nProps }

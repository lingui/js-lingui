// @flow
import * as React from "react"
import PropTypes from "prop-types"
import hoistStatics from "hoist-non-react-statics"
import type { I18n as I18nType } from "@lingui/core"
import { I18n } from "@lingui/react"

type withI18nOptions = {
  update?: boolean,
  withRef?: boolean,
  withHash?: boolean
}

type withI18nProps = {
  i18n: I18nType
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

    class WithI18n extends React.Component<*> {
      static contextTypes = {
        linguiPublisher: PropTypes.object
      }

      wrappedInstance = null

      setWrappedInstance = (ref: any) => {
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

      render() {
        const props = {
          ...this.props,
          ...(withRef ? { ref: this.setWrappedInstance } : {})
        }
        return (
          <I18n update={update} withHash={withHash}>
            {i18nProps => <WrappedComponent {...props} {...i18nProps} />}
          </I18n>
        )
      }
    }

    return hoistStatics(WithI18n, WrappedComponent)
  }

export default withI18n

export type { withI18nProps }

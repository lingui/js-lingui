// @flow
import React from 'react'
import PropTypes from 'prop-types'
import type { I18n } from 'lingui-i18n'

type withI18nOptions = {
  update?: boolean,
  withRef?: boolean,
  forPure?: boolean,
}

type withI18nProps = {
  i18n: I18n
}

const withI18n = (options: withI18nOptions = {}) => function<P, C: React$Component<any, P>> (WrappedComponent: Class<C>): Class<React.Component<any, $Diff<P, withI18nProps>>> {
  if (process.env.NODE_ENV !== 'production') {
    if (typeof options === 'function' || React.isValidElement(options)) {
      console.warn(
        'withI18n([options]) takes options as a first argument, ' +
        'but received React component itself. Without options, the Component ' +
        'should be wrapped as withI18n()(Component), not withI18n(Component).'
      )
    }
  }

  const { update = true, withRef = false, forPure = false } = options

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
          'To access the wrapped instance, you need to specify { withRef: true }' +
          ' in the options argument of the withI18n() call.'
        )
      }

      return this.wrappedInstance
    }

    componentDidMount () {
      const { subscribe } = this.getI18n()
      if (update && subscribe) subscribe(this.checkUpdate)
    }

    componentWillUnmount () {
      const { unsubscribe } = this.getI18n()
      if (update && unsubscribe) unsubscribe(this.checkUpdate)
    }

    // Test checks that subscribe/unsubscribe is called with function.
    checkUpdate = /* istanbul ignore next */() => {
      this.forceUpdate()
    }

    getI18n () {
      return this.context.linguiPublisher || {}
    }

    render () {
      const { i18n } = this.getI18n()
      const props = {
        ...this.props,
        ...(withRef ? { ref: this.setWrappedInstance } : {}),

        // Add date of latest update, so underlying PureComponent is forced
        // to rerender.
        ...(forPure ? { i18nLastUpdate: new Date() } : {})
      }
      return <WrappedComponent {...props} i18n={i18n} />
    }
  }

  // return needs to be here, otherwise flow complains about {...this.props}
  // in WrappedComponent
  return withI18n
}

// Deprecated, remove in 2.x
let deprecationWithI18nOnce = false

const WithI18n = (options: withI18nOptions = {}) => {
  if (process.env.NODE_ENV !== 'production') {
    if (!deprecationWithI18nOnce) {
      deprecationWithI18nOnce = true
      console.warn(
        'WithI18n is deprecated and will be removed in lingui-react@2.x, ' +
        'use withI18n instead (lower-cased first letter).')
    }
  }

  return withI18n(options)
}

export default withI18n
export { WithI18n }

export type { withI18nProps }

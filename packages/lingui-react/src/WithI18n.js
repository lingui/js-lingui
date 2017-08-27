// @flow
import React from 'react'
import PropTypes from 'prop-types'
import type { I18n } from 'lingui-i18n'

type WithI18nOptions = {
  update?: boolean,
  withRef?: boolean
}

type WithI18nProps = {
  i18n: I18n
}

export default (options: WithI18nOptions = {}) => function<P, C: React$Component<any, P>> (WrappedComponent: Class<C>): Class<React.Component<any, $Diff<P, WithI18nProps>>> {
  if (process.env.NODE_ENV !== 'production') {
    if (typeof options === 'function' || React.isValidElement(options)) {
      console.warn(
        'WithI18n([options]) takes options as a first argument, ' +
        'but received React component itself. Without options, the Component ' +
        'should be wrapped as WithI18n()(Component), not WithI18n(Component).'
      )
    }
  }

  const { update = true, withRef = false } = options

  class WithI18n extends React.Component<*, *> {
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
      return <WrappedComponent ref={this.setWrappedInstance} {...this.props} i18n={i18n} />
    }
  }

  // return needs to be here, otherwise flow complains about {...this.props}
  // in WrappedComponent
  return WithI18n
}

export type { WithI18nProps }

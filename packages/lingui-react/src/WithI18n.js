// @flow
import React from 'react'
import type { I18n } from 'lingui-i18n'

type WithI18nOptions = {
  update?: boolean
}

type WithI18nProps = {
  i18n: I18n
}

export default ({
  update = true
}: WithI18nOptions = {}) => (WrappedComponent: ReactClass<*>) => {
  return class WithI18n extends React.Component {
    static contextTypes = {
      i18nManager: React.PropTypes.object
    }

    componentDidMount () {
      if (update) {
        const { subscribe } = this.getI18n()
        if (subscribe) subscribe(this.checkUpdate)
      }
    }

    componentWillUnmount () {
      if (update) {
        const { unsubscribe } = this.getI18n()
        if (unsubscribe) unsubscribe(this.checkUpdate)
      }
    }

    checkUpdate = () => {
      this.forceUpdate()
    }

    getI18n () {
      return this.context.i18nManager || {}
    }

    render () {
      const { i18n } = this.getI18n()
      return <WrappedComponent
        {...this.props}
        i18n={i18n}
      />
    }
  }
}

export type { WithI18nProps }

// @flow
import React from 'react'
import type { I18n } from 'lingui-i18n'

type WithI18nOptions = {
  update?: boolean,
  withRef?: boolean
}

type WithI18nProps = {
  i18n: I18n
}

export default ({ update = true ,withRef = false }: WithI18nOptions = {}) => function<P, C: React$Component<*, P, *>> (WrappedComponent: Class<C>): Class<React.Component<void, $Diff<P, WithI18nProps>, void>> {
  return class WithI18n extends React.Component {
    static contextTypes = {
      i18nManager: React.PropTypes.object
    }

    wrappedInstance=null
    
    setWrappedInstance = withRef?(ref => this.wrappedInstance = ref):null
   
    getWrappedInstance = () => this.wrappedInstance
    

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
      // $FlowIgnore: https://github.com/facebook/flow/issues/3241
      return <WrappedComponent ref={this.setWrappedInstance} {...this.props} i18n={i18n} />
    }
  }
}

export type { WithI18nProps }

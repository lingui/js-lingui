import React from "react"

/*
 * Inject i18n data from context to props.
 */
export default (WrappedComponent) => {
  class InjectI18n extends React.Component {
    componentDidMount() {
      const { subscribe } = this.getI18n()
      if (subscribe) subscribe(this.checkUpdate)
    }

    componentWillUnmount() {
      const { unsubscribe } = this.getI18n()
      if (unsubscribe) unsubscribe(this.checkUpdate)
    }

    checkUpdate = () => {
      this.forceUpdate()
    }

    getI18n() {
      return this.context.i18n || {
        messages: {},
        language: ''
      }
    }

    render() {
      const { language, messages } = this.getI18n()
      return <WrappedComponent
        {...this.props}
        i18n={{ language, messages }}
      />
    }
  }

  InjectI18n.contextTypes = {
    i18n: React.PropTypes.object
  }

  return InjectI18n
}

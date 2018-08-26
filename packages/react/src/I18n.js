// @flow
import * as React from "react"
import PropTypes from "prop-types"

export default class I18n extends React.Component<*, *> {
  static defaultProps = {
    update: true,
    withHash: true
  }

  static contextTypes = {
    linguiPublisher: PropTypes.object
  }

  componentDidMount() {
    const { subscribe } = this.getI18n()
    if (this.props.update && subscribe) subscribe(this.checkUpdate)
  }

  componentWillUnmount() {
    const { unsubscribe } = this.getI18n()
    if (this.props.update && unsubscribe) unsubscribe(this.checkUpdate)
  }

  // Test checks that subscribe/unsubscribe is called with function.
  checkUpdate = /* istanbul ignore next */ () => {
    this.forceUpdate()
  }

  getI18n() {
    return this.context.linguiPublisher || {}
  }

  render() {
    const { children, withHash } = this.props
    const { i18n, i18nHash } = this.getI18n()
    const props = {
      i18n,
      // Add hash of active language and active catalog, so underlying
      // PureComponent is forced to rerender.
      ...(withHash ? { i18nHash } : {})
    }

    return React.isValidElement(children)
      ? React.cloneElement(children, props)
      : React.createElement(children, props)
  }
}

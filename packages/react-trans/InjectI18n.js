import React from "react"

/*
 * Inject i18n data from context to props.
 */
export default (WrappedComponent) => {
  const defaultI18n = {}

  class InjectI18n extends React.Component {
    render() {
      return <WrappedComponent
        {...this.props}
        i18n={this.context.i18n || defaultI18n}
      />
    }
  }

  InjectI18n.contextTypes = {
    i18n: React.PropTypes.object
  }

  return InjectI18n
}

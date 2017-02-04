import React from "react"
import MessageFormat from "messageformat"

import InjectI18n from './InjectI18n'
import type { I18nProps } from './I18nProvider'
import { formatElements } from './format'

type TransProps = {
  id: string,
  defaults?: string,
  params?: Object,
  i18n: I18nProps,

  className?: string
}

type TransState = {
  msgCache: Function
}

class Trans extends React.Component {
  props: TransProps
  state: TransState

  constructor(props, context) {
    super(props, context)
    this.state = {
      msgCache: this.compileMessage(this.props)
    }
  }

  compileMessage(props) {
    const {
      id, defaults, i18n: { translate, language }
    } = props

    const translation = translate(id) || defaults || id

    return new MessageFormat(language).compile(translation)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.id !== nextProps.id || this.props.defaults !== nextProps.defaults) {
      this.setState({
        msgCache: this.compileMessage(nextProps)
      })
    }
  }

  render() {
    const {
      params, components, className
    } = this.props
    const { msgCache } = this.state

    const translation = formatElements(msgCache(params), components)

    return <span className={className}>{translation}</span>
  }
}


export default InjectI18n(Trans)

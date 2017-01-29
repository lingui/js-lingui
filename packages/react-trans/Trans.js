import React from "react"
import MessageFormat from "messageformat"

import InjectI18n from './InjectI18n'
import type { I18nProps } from './I18nProvider'


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
      msgCache: this.compileMessage()
    }

  }

  compileMessage() {
    const {
      id, defaults, i18n: { messages, language }
    } = this.props

    const translation = messages[id] || defaults || id

    return new MessageFormat(language).compile(translation)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.id !== nextProps.id || this.props.defaults !== nextProps.defaults) {
      this.setState({
        msgCache: this.compileMsg()
      })
    }
  }

  render() {
    const {
      params, className
    } = this.props
    const { msgCache } = this.state

    return <span className={className}>{msgCache(params)}</span>
  }
}


export default InjectI18n(Trans)

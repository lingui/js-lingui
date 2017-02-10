/* @flow */
import React from 'react'

import WithI18n from './WithI18n'
import type { I18nProps } from './I18nProvider'
import { formatElements } from './format'

type TransProps = {
  id: string,
  defaults?: string,
  params?: Object,
  components?: Array<React$Element<any>>,
  i18n: I18nProps,

  className?: string
}

type TransState = {
  msgCache: Function
}

class Trans extends React.Component {
  props: TransProps
  state: TransState

  constructor (props, context) {
    super(props, context)
    this.state = {
      msgCache: this.compileMessage(this.props)
    }
  }

  getTranslation (props) {
    const {
      id, defaults, i18n
    } = props

    const translation = (i18n.messages ? i18n.messages[id] : '') || defaults || id
    return { i18n, translation }
  }

  compileMessage (props) {
    const { translation, i18n } = this.getTranslation(props)

    if (!i18n.compile) return () => translation
    return i18n.compile(translation)
  }

  componentWillReceiveProps (nextProps) {
    const { language, translation } = this.state
    const next = this.getTranslation(nextProps)

    if (
      translation !== next.translation ||
      language !== next.i18n.language
    ) {
      this.setState({
        msgCache: this.compileMessage(nextProps),
        language,
        translation
      })
    }
  }

  render () {
    const {
      params, components, className
    } = this.props
    const { msgCache } = this.state

    const translation = formatElements(msgCache(params), components)

    return <span className={className}>{translation}</span>
  }
}

Trans.defaultProps = {
  i18n: {}
}

export default WithI18n()(Trans)

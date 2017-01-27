import React from "react"
import formatMessage from "format-message"

import InjectI18n from './InjectI18n'
import type { I18nProps } from './I18nProvider'


type TransProps = {
  id: string,
  defaults?: string,
  params?: Object,
  i18n: I18nProps,

  className?: string
}

class Trans extends React.Component {
  props: TransProps

  render() {
    const {
      id, defaults, params,
      i18n: { messages },

      className
    } = this.props

    let translation = messages[id] || defaults || id

    if (params) {
      translation = formatMessage(translation, params)
    }

    return <span className={className}>{translation}</span>
  }
}


export default InjectI18n(Trans)

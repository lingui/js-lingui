import React from "react"
import InjectI18n from './InjectI18n'
import type { I18nProps } from './I18nProvider'


type TransProps = {
  id: string,
  id?: defaults,
  i18n: I18nProps,

  className?: string
}

class Trans extends React.Component {
  props: TransProps

  render() {
    const {
      id, defaults,
      i18n: { messages },

      className
    } = this.props

    return <span className={className}>{messages[id] || defaults || id}</span>
  }
}


export default InjectI18n(Trans)

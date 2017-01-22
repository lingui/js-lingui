import React from "react"
import InjectI18n from './InjectI18n'
import type { I18nProps } from './I18nProvider'


type TransProps = {
  id: string,
  id?: defaults,
  i18n: I18nProps
}

class Trans extends React.Component {
  props: TransProps

  render() {
    const {
      id, defaults,
      i18n: { messages }
    } = this.props

    return <span>{messages[id] || defaults || id}</span>
  }
}


export default InjectI18n(Trans)

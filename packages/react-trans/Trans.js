import React from "react"
import InjectI18n from './InjectI18n'


type TransProps = {
  id: string,
  id?: defaults,
  i18n: Object
}

class Trans extends React.Component {
  props: TransProps

  render() {
    const {
      id, defaults,
      i18n: { catalog = {} }
    } = this.props

    return <span>{catalog[id] || defaults || id}</span>
  }
}


export default InjectI18n(Trans)

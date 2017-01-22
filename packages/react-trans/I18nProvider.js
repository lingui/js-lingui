import React from "react"

type I18nProps = {
  messages: {[key: string]: string},
  language: string
}

type I18nProviderProps = I18nProps & {
  children: any
}

class I18nProvider extends React.Component {
  props: I18nProviderProps

  getChildContext() {
    const { messages, language } = this.props

    return {
      i18n: { messages, language }
    }
  }

  render() {
    return this.props.children
  }
}

I18nProvider.childContextTypes = {
  i18n: React.PropTypes.object
}

export default I18nProvider
export type { I18nProps }

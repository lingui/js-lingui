import React from "react"

type I18nProps = {
  messages: {[key: string]: string},
  language: string,
  subscribe: Function,
  unsubscribe: Function
}

type I18nProviderProps = I18nProps & {
  children: any
}

class I18nProvider extends React.Component {
  props: I18nProviderProps

  subscribers = []

  subscribe = (callback) => {
    this.subscribers.push(callback)
  }

  unsubscribe = (callback) => {
    this.subscribers = this.subscribers.filter(cb => cb !== callback)
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.language !== prevProps.language ||
      this.props.messages !== prevProps.messages
    ) {
      this.subscribers.forEach(f => f())
    }
  }

  getChildContext() {
    const { messages, language } = this.props

    return {
      i18n: {
        messages, language,
        subscribe: this.subscribe,
        unsubscribe: this.unsubscribe
      }
    }
  }

  render() {
    const { children } = this.props
    return children.length > 1 ? <div>{children}</div> : children
  }
}

I18nProvider.childContextTypes = {
  i18n: React.PropTypes.object
}

export default I18nProvider
export type { I18nProps }

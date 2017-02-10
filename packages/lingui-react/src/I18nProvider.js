import React from 'react'

type I18nProps = {
  messages: {[key: string]: string},
  language: string,
  subscribe: Function,
  unsubscribe: Function
}

type I18nProviderProps = I18nProps & {
  children: any
}

/*
 * I18n - Container for i18n data (language, messages)
 * Allows listeners to subscribe for changes
 */
class I18n {
  subscribers = []

  constructor (props) {
    this.update(props)
  }

  subscribe = (callback) => {
    this.subscribers.push(callback)
  }

  unsubscribe = (callback) => {
    this.subscribers = this.subscribers.filter(cb => cb !== callback)
  }

  update = (props) => {
    if (!props) return

    const filteredProps = ['messages', 'language'].reduce((acc, key) => {
      if (props[key]) acc[key] = props[key]
      return acc
    }, {})

    if (!Object.keys(filteredProps).length) return

    this.props = { ...this.props, ...filteredProps }
    this.subscribers.forEach(f => f())
  }

  get messages () {
    return this.props.messages
  }

  get language () {
    return this.props.language
  }
}

class I18nProvider extends React.Component {
  props: I18nProviderProps

  constructor (props) {
    super(props)
    this.i18n = new I18n(props)
  }

  componentDidUpdate (prevProps) {
    if (
      this.props.language !== prevProps.language ||
      this.props.messages !== prevProps.messages
    ) {
      this.i18n.update(this.props)
    }
  }

  getChildContext () {
    return {
      i18n: this.i18n
    }
  }

  render () {
    const { children } = this.props
    return children.length > 1 ? <div>{children}</div> : children
  }
}

I18nProvider.childContextTypes = {
  i18n: React.PropTypes.object
}

export default I18nProvider
export { I18n }
export type { I18nProps }

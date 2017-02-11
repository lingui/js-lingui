/* @flow */
import React from 'react'
import { I18n } from 'lingui-i18n'
import type { Catalogs } from 'lingui-i18n'

type I18nProviderProps = {
  children: any,
  language: string,
  messages: Catalogs,
  i18n?: I18n
}

/*
 * I18nManager - Connects to lingui-i18n/I18n class
 * Allows listeners to subscribe for changes
 */
class I18nManager {
  i18n: I18n
  subscribers = []

  constructor (language: string, messages?: Catalogs, i18n?: I18n) {
    this.i18n = i18n || new I18n(language, messages)
  }

  subscribe = (callback: Function) => {
    this.subscribers.push(callback)
  }

  unsubscribe = (callback: Function) => {
    this.subscribers = this.subscribers.filter(cb => cb !== callback)
  }

  update = ({ messages, language }: { messages?: Catalogs, language?: string } = {}) => {
    if (!messages && !language) return

    this.i18n.load(messages)
    this.i18n.activate(language)
    this.subscribers.forEach(f => f())
  }
}

class I18nProvider extends React.Component {
  i18nManager: I18nManager
  props: I18nProviderProps

  constructor (props: I18nProviderProps) {
    super(props)
    const { language, messages, i18n } = this.props
    this.i18nManager = new I18nManager(language, messages, i18n)
  }

  componentDidUpdate (prevProps: I18nProviderProps) {
    const { language, messages } = this.props
    if (
      language !== prevProps.language ||
      messages !== prevProps.messages
    ) {
      this.i18nManager.update({ language, messages })
    }
  }

  getChildContext () {
    return {
      i18nManager: this.i18nManager
    }
  }

  render () {
    const { children } = this.props
    return children.length > 1 ? <div>{children}</div> : children
  }
}

I18nProvider.childContextTypes = {
  i18nManager: React.PropTypes.object.isRequired
}

export default I18nProvider
export { I18nManager }

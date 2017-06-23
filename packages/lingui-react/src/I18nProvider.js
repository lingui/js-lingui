/* @flow */
import React from 'react'
import PropTypes from 'prop-types'
import { I18n } from 'lingui-i18n'
import type { Catalogs, AllLanguageData } from 'lingui-i18n'

type I18nProviderProps = {
  children?: any,
  language: string,
  messages: Catalogs,
  languageData: AllLanguageData,
  i18n?: I18n
}

/*
 * I18nManager - Connects to lingui-i18n/I18n class
 * Allows listeners to subscribe for changes
 */
class I18nManager {
  i18n: I18n
  subscribers = []

  constructor ({ language, messages, languageData, i18n }: {
    language: string,
    messages?: Catalogs,
    languageData?: AllLanguageData,
    i18n?: I18n
  }) {
    this.i18n = i18n || new I18n(language, messages, languageData)
  }

  subscribe = (callback: Function) => {
    this.subscribers.push(callback)
  }

  unsubscribe = (callback: Function) => {
    this.subscribers = this.subscribers.filter(cb => cb !== callback)
  }

  update = ({ messages, language, languageData }: { messages?: Catalogs, language?: string, languagedata?: AllLanguageData } = {}) => {
    if (!messages && !language && !languageData) return

    if (messages) this.i18n.load(messages)
    if (language) this.i18n.activate(language)
    if (languageData) this.i18n.loadLanguageData(languageData)
    this.subscribers.forEach(f => f())
  }
}

class I18nProvider extends React.Component {
  props: I18nProviderProps

  i18nManager: I18nManager

  constructor (props: I18nProviderProps) {
    super(props)
    const { language, messages, languageData, i18n } = this.props
    this.i18nManager = new I18nManager({ language, messages, languageData, i18n })
  }

  componentDidUpdate (prevProps: I18nProviderProps) {
    const { language, messages, languageData } = this.props
    if (
      language !== prevProps.language ||
      messages !== prevProps.messages ||
      languageData !== prevProps.languageData
    ) {
      this.i18nManager.update({ language, messages, languageData })
    }
  }

  getChildContext () {
    return {
      i18nManager: this.i18nManager
    }
  }

  render () {
    const { children } = this.props
    return children && children.length > 1 ? <div>{children}</div> : children
  }
}

I18nProvider.childContextTypes = {
  i18nManager: PropTypes.object.isRequired
}

export default I18nProvider
export { I18nManager }
export type { I18nProviderProps }

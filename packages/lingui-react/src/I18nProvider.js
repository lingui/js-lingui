/* @flow */
import React from 'react'
import PropTypes from 'prop-types'
import { setupI18n } from 'lingui-i18n'
import type { I18n } from 'lingui-i18n'
import type { Catalogs, AllLanguageData } from 'lingui-i18n'

export type I18nProviderProps = {
  children?: any,
  language: string,
  messages: Catalogs,
  languageData?: AllLanguageData,
  development?: Object,
  i18n?: I18n
}

/*
 * I18nPublisher - Connects to lingui-i18n/I18n class
 * Allows listeners to subscribe for changes
 */
export function LinguiPublisher (i18n: I18n) {
  let subscribers = []

  return {
    i18n,

    getSubscribers () {
      return subscribers
    },

    subscribe (callback: Function) {
      subscribers.push(callback)
    },

    unsubscribe (callback: Function) {
      subscribers = subscribers.filter(cb => cb !== callback)
    },

    update ({ messages, language, languageData }: {
      messages?: Catalogs,
      language?: string,
      languageData?: AllLanguageData
    } = {}) {
      if (!messages && !language && !languageData) return

      if (messages) i18n.load(messages)
      if (language) i18n.activate(language)
      if (languageData) i18n.loadLanguageData(languageData)

      subscribers.forEach(f => f())
    }
  }
}

export default class I18nProvider extends React.Component {
  props: I18nProviderProps

  linguiPublisher: LinguiPublisher

  static childContextTypes = {
    linguiPublisher: PropTypes.object.isRequired
  }

  constructor (props: I18nProviderProps) {
    super(props)
    const { language, messages, languageData, development } = this.props
    const i18n = this.props.i18n || setupI18n({
      language,
      messages,
      languageData,
      development
    })
    this.linguiPublisher = new LinguiPublisher(i18n)
  }

  componentDidUpdate (prevProps: I18nProviderProps) {
    const { language, messages, languageData } = this.props
    if (
      language !== prevProps.language ||
      messages !== prevProps.messages ||
      languageData !== prevProps.languageData
    ) {
      this.linguiPublisher.update({ language, messages, languageData })
    }
  }

  getChildContext () {
    return {
      linguiPublisher: this.linguiPublisher
    }
  }

  render () {
    const { children } = this.props
    return children && children.length > 1 ? <div>{children}</div> : children
  }
}

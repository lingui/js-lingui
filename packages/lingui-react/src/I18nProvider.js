/* @flow */
import React from 'react'
import PropTypes from 'prop-types'
import { setupI18n } from 'lingui-i18n'
import type { I18n, Catalogs } from 'lingui-i18n'

export type I18nProviderProps = {
  children?: any,
  language: string,
  catalogs?: Catalogs,
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

    update ({ catalogs, language }: {
      catalogs?: Catalogs,
      language?: string
    } = {}) {
      if (!catalogs && !language) return

      if (catalogs) i18n.load(catalogs)
      if (language) i18n.activate(language)

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
    const { language, catalogs, development } = this.props
    const i18n = this.props.i18n || setupI18n({
      language,
      catalogs,
      development
    })
    this.linguiPublisher = new LinguiPublisher(i18n)
  }

  componentDidUpdate (prevProps: I18nProviderProps) {
    const { language, catalogs } = this.props
    if (
      language !== prevProps.language ||
      catalogs !== prevProps.catalogs
    ) {
      this.linguiPublisher.update({ language, catalogs })
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

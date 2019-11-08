// @flow
import * as React from "react"
import PropTypes from "prop-types"
import hashSum from "hash-sum"

import { setupI18n } from "@lingui/core"
import type { I18n, Catalogs, Locales } from "@lingui/core"

export type I18nProviderProps = {
  children?: any,
  language: string,
  locales?: Locales,
  catalogs?: Catalogs,
  i18n?: I18n,
  missing?: string | Function,

  defaultRender: ?any
}

type LinguiPublisher = {|
  i18n: I18n,
  i18nHash: null,

  getSubscribers(): Array<Function>,

  subscribe(callback: Function): void,

  unsubscribe(callback: Function): void,

  update(?{ catalogs?: Catalogs, language?: string, locales?: Locales }): void
|}

/*
 * I18nPublisher - Connects to lingui-i18n/I18n class
 * Allows listeners to subscribe for changes
 */
export function makeLinguiPublisher(i18n: I18n): LinguiPublisher {
  let subscribers: Array<Function> = []

  return {
    i18n,
    i18nHash: null,

    getSubscribers() {
      return subscribers
    },

    subscribe(callback: Function) {
      subscribers.push(callback)
    },

    unsubscribe(callback: Function) {
      subscribers = subscribers.filter(cb => cb !== callback)
    },

    update(
      params: ?{
        catalogs?: Catalogs,
        language?: string,
        locales?: Locales
      } = {}
    ) {
      if (!params) return
      const { catalogs, language, locales } = params
      if (!catalogs && !language && !locales) return

      if (catalogs) i18n.load(catalogs)
      if (language) i18n.activate(language, locales)

      this.i18nHash = hashSum([i18n.language, i18n.messages])

      subscribers.forEach(f => f())
    }
  }
}

export default class I18nProvider extends React.Component<I18nProviderProps> {
  props: I18nProviderProps

  linguiPublisher: LinguiPublisher

  static defaultProps = {
    defaultRender: null
  }

  static childContextTypes = {
    linguiPublisher: PropTypes.object.isRequired,
    linguiDefaultRender: PropTypes.any
  }

  constructor(props: I18nProviderProps) {
    super(props)
    const { language, locales, catalogs, missing } = props
    const i18n =
      props.i18n ||
      setupI18n({
        language,
        locales,
        catalogs
      })
    this.linguiPublisher = makeLinguiPublisher(i18n)
    this.linguiPublisher.i18n._missing = this.props.missing
  }

  componentDidUpdate(prevProps: I18nProviderProps) {
    const { language, locales, catalogs } = this.props
    if (
      language !== prevProps.language ||
      locales !== prevProps.locales ||
      catalogs !== prevProps.catalogs
    ) {
      this.linguiPublisher.update({ language, catalogs, locales })
    }

    this.linguiPublisher.i18n._missing = this.props.missing
  }

  getChildContext() {
    return {
      linguiPublisher: this.linguiPublisher,
      linguiDefaultRender: this.props.defaultRender
    }
  }

  render() {
    return this.props.children || null
  }
}

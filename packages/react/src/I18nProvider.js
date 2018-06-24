/* @flow */
import * as React from "react"
import type { Node } from "react"
import PropTypes from "prop-types"
import hashSum from "hash-sum"

import { setupI18n } from "@lingui/core"
import type { I18n, Catalogs } from "@lingui/core"

export type I18nProviderProps = {
  children?: Node,
  language: string,
  catalogs?: Catalogs,
  i18n?: I18n,

  defaultRender: Node
}

/*
 * I18nPublisher - Connects to lingui-i18n/I18n class
 * Allows listeners to subscribe for changes
 */
export function LinguiPublisher(i18n: I18n) {
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

    update({
      catalogs,
      language
    }: { catalogs?: Catalogs, language?: string } = {}) {
      if (!catalogs && !language) return

      if (catalogs) i18n.load(catalogs)
      if (language) i18n.activate(language)

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
    const { language, catalogs } = props
    const i18n =
      props.i18n ||
      setupI18n({
        language,
        catalogs
      })
    this.linguiPublisher = new LinguiPublisher(i18n)
  }

  componentDidUpdate(prevProps: I18nProviderProps) {
    const { language, catalogs } = this.props
    if (language !== prevProps.language || catalogs !== prevProps.catalogs) {
      this.linguiPublisher.update({ language, catalogs })
    }
  }

  getChildContext() {
    return {
      linguiPublisher: this.linguiPublisher,
      linguiDefaultRender: this.props.defaultRender
    }
  }

  render() {
    return <React.Fragment>{this.props.children}</React.Fragment>
  }
}

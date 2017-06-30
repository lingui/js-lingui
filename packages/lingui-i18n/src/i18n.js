/* @flow */
import { interpolate } from './context'
import { isString } from './essentials'
import t from './t'
import { select, plural, selectOrdinal } from './select'

type Catalog = {[key: string]: string | Function}
type Catalogs = {[key: string]: Catalog}

type Message = {|
  id: string,
  defaults?: string,
  params?: Object,
  formats?: Object
|}

type LanguageData = {
  plurals: Function
}
type AllLanguageData = {[key: string]: LanguageData}

class I18n {
  _language: string
  _messages: Catalogs
  _languageData: AllLanguageData

  _dev: Object

  t: Function
  plural: Function
  select: Function
  selectOrdinal: Function

  constructor (language?: string, messages?: Catalogs = {}, languageData?: AllLanguageData = {}) {
    this._messages = messages
    this._languageData = languageData

    if (language) {
      this.activate(language)
    }

    if (process.env.NODE_ENV !== 'production') {
      this.t = t
      this.select = select
      this.plural = plural(this)
      this.selectOrdinal = selectOrdinal(this)
    }
  }

  get availableLanguages (): Array<string> {
    return Object.keys(this._messages)
  }

  get messages (): Catalog {
    return this._messages[this.language] || {}
  }

  get languageData (): LanguageData {
    const data = this._languageData[this.language]

    if (process.env.NODE_ENV !== 'production') {
      // Allow overriding data in development, useful for testing
      if (!data) {
        return this._dev.loadLanguageData(this.language)
      }
    }

    return data
  }

  get language (): string {
    return this._language
  }

  load (messages: Catalogs) {
    if (!messages) return

    // deeply merge Catalogs
    Object.keys({ ...this._messages, ...messages }).forEach(language => {
      if (!this._messages[language]) this._messages[language] = {}

      let compiledMessages = messages[language] || {}

      if (process.env.NODE_ENV !== 'production') {
        compiledMessages = Object.keys(compiledMessages).reduce((dict, id) => {
          const msg = compiledMessages[id]
          dict[id] = isString(msg) ? this._dev.compile(msg) : msg
          return dict
        }, {})
      }

      Object.assign(
        this._messages[language],
        compiledMessages
      )
    })
  }

  loadLanguageData (languageData: AllLanguageData) {
    if (!languageData) return
    Object.assign(this._languageData, languageData)
  }

  activate (language: string) {
    if (!language) return

    if (process.env.NODE_ENV !== 'production') {
      if (this.availableLanguages.indexOf(language) === -1) {
        console.warn(`Unknown locale "${language}".`)
      }
    }

    this._language = language
  }

  use (language: string) {
    return new I18n(language, this._messages)
  }

  // default translate method
  _ ({ id, defaults, params = {}, formats = {} }: Message) {
    const translation = this.messages[id] || defaults || id

    if (typeof translation !== 'function') return translation
    return interpolate(translation, this.language, this.languageData)(params, formats)
  }

  pluralForm (n: number, pluralType?: 'cardinal' | 'ordinal' = 'cardinal'): string {
    return this.languageData.plurals(n, pluralType === 'ordinal')
  }

  development(config: Object) {
    this._dev = config
  }
}

export default new I18n()
export { I18n }
export type { Message, Catalog, Catalogs, AllLanguageData, LanguageData }

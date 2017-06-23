/* @flow */
import t from './t'
import { select, plural, selectOrdinal } from './select'
import compile from './compile'

import { loadLanguageData } from './utils.dev'

type Catalog = {[key: string]: string}
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

    this.t = t(this)
    this.plural = plural(this)
    this.select = select
    this.selectOrdinal = selectOrdinal(this)
  }

  get availableLanguages (): Array<string> {
    return Object.keys(this._messages)
  }

  get messages (): Catalog {
    return this._messages[this.language] || {}
  }

  get languageData (): LanguageData {
    const data = this._languageData[this.language]

    if (!data && process.env.NODE_ENV !== 'production') {
      return loadLanguageData(this.language)
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

      Object.assign(
        this._messages[language],
        messages[language] || {}
      )
    })
  }

  loadLanguageData (languageData: AllLanguageData) {
    if (!languageData) return

    // deeply merge Catalogs
    Object.keys({ ...this._languageData, ...languageData }).forEach(language => {
      if (!this._languageData[language]) this._languageData[language] = {}

      Object.assign(
        this._languageData[language],
        languageData[language] || {}
      )
    })
  }

  activate (language: string) {
    if (!language) return

    if (!this.availableLanguages.includes(language)) {
      throw new Error(`Unknown locale "${language}".`)
    }

    this._language = language
  }

  use (language: string) {
    return new I18n(language, this._messages)
  }

  translate ({ id, defaults, params = {}, formats = {} }: Message) {
    const translation = this.messages[id] || defaults || id
    return this.compile(translation, formats)(params)
  }

  compile (message: string, formats?: Object) {
    return compile(this.language, message, this.languageData, formats)
  }

  pluralForm (n: number, pluralType?: 'cardinal' | 'ordinal' = 'cardinal'): string {
    const forms = this.languageData.plurals
    return forms(n, pluralType === 'ordinal') || 'other'
  }
}

export default new I18n()
export { I18n }
export type { Message, Catalog, Catalogs, AllLanguageData }

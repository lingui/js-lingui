/* @flow */
import MessageFormat from 'messageformat'
import t from './t'
import { select, plural } from './select'
import plurals from './plurals'

type Catalog = {[key: string]: string}
type Catalogs = {[key: string]: Catalog}

type Message = {|
  id: string,
  params?: Object
|}

class I18n {
  _language: string
  _messages: Catalogs

  t: Function
  plural: Function
  select: Function

  constructor (language: string = '', messages: Catalogs = {}) {
    this._language = language
    this._messages = messages

    this.t = t(this)
    this.plural = plural(this)
    this.select = select
  }

  get messages (): Catalog {
    return this._messages[this._language] || {}
  }

  get language (): string {
    return this._language
  }

  load (messages: { [key: string]: Catalog }) {
    this._messages = messages
  }

  activate (language: string) {
    this._language = language
  }

  use (language: string) {
    return new I18n(language, this._messages)
  }

  translate ({ id, params = {} }: Message) {
    return this.compile(id)(params)
  }

  compile (message: string) {
    const translation = this.messages[message] || message
    return new MessageFormat(this.language).compile(translation)
  }

  pluralForm (n: number, cardinal?: 'cardinal' | 'ordinal' = 'cardinal'): string {
    const forms = plurals[this._language]
    const form = forms[cardinal] || forms['cardinal']
    return form(n)
  }
}

export default new I18n()
export { I18n }
export type { Message, Catalog }

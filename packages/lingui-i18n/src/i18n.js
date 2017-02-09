import MessageFormat from "messageformat"
import t from './t'
import { select, plural } from './select'


function I18n() {
  this.language = ''
  this.messages = {}

  this.t = this.bindFormat(t)
  this.select = this.bindFormat(select)
  this.plural = this.bindFormat(plural)
}

I18n.prototype.use = function (language: string, messages: { [key: string]: string } = {}) {
  this.language = language
  this.messages = messages
}

I18n.prototype.translate = function (message: string, params: Object = {}) {
  return this.compile(message)(params)
}

I18n.prototype.compile = function (message: string) {
  const translation = this.messages[message] || message
  return new MessageFormat(this.language).compile(translation)
}

I18n.prototype.bindFormat = function (format) {
  return (...args) => {
    const { message, params } = format(...args)
    return this.translate(message, params)
  }
}

export default new I18n()
export { I18n }

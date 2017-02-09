import MessageFormat from "messageformat"


function I18n() {
  this.language = ''
  this.messages = {}
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

export default new I18n()
export { I18n }

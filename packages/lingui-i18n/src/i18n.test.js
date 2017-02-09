import { I18n,  default as exportedI18n } from './i18n'

describe('I18n', function() {
  it('should export default I18n instance', function() {
    expect(exportedI18n).toBeInstanceOf(I18n)
  })

  it('should be initialized with empty catalog', function() {
    const i18n = new I18n()
    expect(i18n.messages).toEqual({})
  })

  it('should bound t method', function() {
    const i18n = new I18n()
    expect(i18n.t).toBeInstanceOf(Function)

    i18n.use('fr', {
      "Hello {name}": "Salut {name}"
    })

    expect(i18n.t`Message`).toEqual('Message')
    expect(i18n.t('Message')).toEqual('Message')

    const name = 'Fred'
    expect(i18n.t`Hello ${{name}}`).toEqual('Salut Fred')
    expect(i18n.t('Hello {name}', { name })).toEqual('Salut Fred')
  })

  it('.use should load messages and set active language', function() {
    const i18n = new I18n()
    const messages = {
      "Hello": "Salut"
    }

    i18n.use('en', messages)
    expect(i18n.language).toEqual("en")
    expect(i18n.messages).toEqual(messages)

    // messages should be object even if we omit them
    i18n.use('fr')
    expect(i18n.messages).toBeInstanceOf(Object)
  })

  it('.translate should translate and format message', function() {
    const i18n = new I18n()
    const messages = {
      "Hello": "Salut",
      "My name is {name}": "Je m'appelle {name}"
    }
    i18n.use('en', messages)
    expect(i18n.translate("Hello")).toEqual("Salut")
    expect(i18n.translate("My name is {name}", { name: "Fred" }))
      .toEqual("Je m'appelle Fred")

    // missing { name }
    // the output isn't ideal, but at least it doesn't blow up
    expect(i18n.translate("My name is {name}"))
      .toEqual("Je m'appelle undefined")

    // Untranslated message
    expect(i18n.translate("Missing message")).toEqual("Missing message")
  })

  it('.compile should return compiled message', function() {
    const i18n = new I18n()
    const messages = {
      "Hello": "Salut",
      "My name is {name}": "Je m'appelle {name}"
    }
    i18n.use('en', messages)

    const msg = i18n.compile("My name is {name}")
    expect(msg).toBeInstanceOf(Function)
    expect(msg({ name: "Fred" })).toEqual("Je m'appelle Fred")

    // Untranslated message
    const untranslated = i18n.compile("Missing message")
    expect(untranslated()).toEqual("Missing message")
  })
})

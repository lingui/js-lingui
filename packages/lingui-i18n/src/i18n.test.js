/* @flow */
import { I18n, default as exportedI18n } from '.'

describe('I18n', function () {
  it('should export default I18n instance', function () {
    expect(exportedI18n).toBeInstanceOf(I18n)
  })

  it('should be initialized with empty catalog', function () {
    const i18n = new I18n()
    expect(i18n.messages).toEqual({})
  })

  it('should bound t method', function () {
    const i18n = new I18n()
    expect(i18n.t).toBeInstanceOf(Function)

    expect(i18n.t`Message`).toEqual('Message')

    const name = 'Fred'
    expect(i18n.t`Hello ${name}`).toEqual('Hello Fred')
  })

  it('.activate should switch active language', function () {
    const i18n = new I18n()
    const messages = {
      'Hello': 'Salut'
    }

    i18n.load({ fr: messages })
    i18n.activate('en')
    expect(i18n.language).toEqual('en')
    expect(i18n.messages).toEqual({})

    i18n.activate('fr')
    expect(i18n.language).toEqual('fr')
    expect(i18n.messages).toEqual(messages)
  })

  it('.use should return new i18n object with switched language', function () {
    const i18n = new I18n()
    const messages = {
      en: {
        'Hello': 'Hello'
      },
      fr: {
        'Hello': 'Salut'
      }
    }

    i18n.load(messages)
    i18n.activate('en')
    expect(i18n.translate({ id: 'Hello' })).toEqual('Hello')

    // change language locally
    expect(i18n.use('fr').translate({ id: 'Hello' })).toEqual('Salut')

    // global language hasn't changed
    expect(i18n.translate({ id: 'Hello' })).toEqual('Hello')
  })

  it('.translate should format message from catalog', function () {
    const i18n = new I18n()
    const messages = {
      'Hello': 'Salut',
      'My name is {name}': 'Je m\'appelle {name}'
    }

    i18n.load({ fr: messages })
    i18n.activate('fr')

    expect(i18n.translate({ id: 'Hello' })).toEqual('Salut')
    expect(i18n.translate({ id: 'My name is {name}', params: { name: 'Fred' } }))
      .toEqual("Je m'appelle Fred")

    // missing { name }
    // the output isn't ideal, but at least it doesn't blow up
    expect(i18n.translate({ id: 'My name is {name}' }))
      .toEqual("Je m'appelle undefined")

    // Untranslated message
    expect(i18n.translate({ id: 'Missing message' })).toEqual('Missing message')
  })

  it('.compile should return compiled message', function () {
    const i18n = new I18n()
    const messages = {
      'Hello': 'Salut',
      'My name is {name}': "Je m'appelle {name}"
    }

    i18n.load({ fr: messages })
    i18n.activate('fr')

    const msg = i18n.compile('My name is {name}')
    expect(msg).toBeInstanceOf(Function)
    expect(msg({ name: 'Fred' })).toEqual("Je m'appelle Fred")

    // Untranslated message
    const untranslated = i18n.compile('Missing message')
    expect(untranslated()).toEqual('Missing message')
  })
})

/* @flow */
import i18n, { setupI18n } from '.'
import { mockConsole, mockEnv } from './mocks'
import linguiDev from './dev'

describe('I18n', function () {
  it('should export default I18n instance', function () {
    expect(i18n).toBeDefined()
  })

  it('should be initialized with empty catalog', function () {
    const i18n = setupI18n()
    expect(i18n.messages).toEqual({})
  })

  it('should bound t method', function () {
    const i18n = setupI18n()
    expect(i18n.t).toBeInstanceOf(Function)

    expect(i18n.t`Message`).toEqual('Message')

    const name = 'Fred'
    expect(i18n.t`Hello ${name}`).toEqual('Hello Fred')
  })

  it('.load should load catalog and merge with existing', function () {
    const messages = {
      en: {
        'Hello': 'Hello'
      }
    }

    const i18n = setupI18n({
      development: linguiDev
    })
    expect(i18n.messages).toEqual({})

    i18n.load({ en: messages.en })
    i18n.activate('en')
    expect(i18n.messages).toEqual(messages.en)

    // fr catalog shouldn't affect the english one
    i18n.load({ fr: { 'Hello': 'Salut' } })
    expect(i18n.messages).toEqual(messages.en)

    i18n.load({ en: { 'Goodbye': 'Goodbye' } })
    // $FlowIgnore: testing edge case
    i18n.load() // should do nothing
    expect(i18n.messages).toEqual({
      'Hello': 'Hello',
      'Goodbye': 'Goodbye'
    })
  })

  it('.loadLanguageData should load language data and merge with existing', function () {
    const languageData = {
      en: {
        plurals: jest.fn(),
        code: 'en-US'
      }
    }

    const i18n = setupI18n({
      language: 'en',
      languageData,
      messages: {en: {}, fr: {}},
    })

    expect(i18n.languageData).toEqual(languageData.en)

    // fr catalog shouldn't affect the english one
    i18n.loadLanguageData({ fr: { plurals: jest.fn(), code: 'fr-FR' } })
    // $FlowIgnore: testing edge case
    i18n.loadLanguageData() // should do nothing
    expect(i18n.languageData).toEqual(languageData.en)
  })

  it('.activate should switch active language', function () {
    const messages = {
      'Hello': 'Salut'
    }

    const i18n = setupI18n({
      language: 'en',
      messages: { fr: messages, en: {} },
      development: linguiDev
    })

    expect(i18n.language).toEqual('en')
    expect(i18n.messages).toEqual({})

    i18n.activate('fr')
    // $FlowIgnore: testing edge case
    i18n.activate() // should do nothing
    expect(i18n.language).toEqual('fr')
    expect(i18n.messages).toEqual(messages)
  })

  it('.activate should throw an error about incorrect language', function () {
    const i18n = setupI18n()

    mockConsole(console => {
      i18n.activate('xyz')
      expect(console.warn).toBeCalledWith(expect.stringContaining('Unknown local'))
    })

    mockConsole(console => {
      mockEnv('production', () => {
        i18n.activate('xyz')
        expect(console.warn).not.toBeCalled()
      })
    })
  })

  it('.use should return new i18n object with switched language', function () {
    const messages = {
      en: {
        'Hello': 'Hello'
      },
      fr: {
        'Hello': 'Salut'
      }
    }

    const i18n = setupI18n({
      language: 'en',
      messages: messages,
      development: linguiDev
    })

    expect(i18n._({ id: 'Hello' })).toEqual('Hello')

    // change language locally
    expect(i18n.use('fr')._({ id: 'Hello' })).toEqual('Salut')

    // global language hasn't changed
    expect(i18n._({ id: 'Hello' })).toEqual('Hello')
  })

  it('._ should format message from catalog', function () {
    const messages = {
      'Hello': 'Salut',
      'My name is {name}': 'Je m\'appelle {name}'
    }

    const i18n = setupI18n({
      language: 'fr',
      messages: { fr: messages },
      development: linguiDev
    })

    expect(i18n._({ id: 'Hello' })).toEqual('Salut')
    expect(i18n._({ id: 'My name is {name}', values: { name: 'Fred' } }))
      .toEqual("Je m'appelle Fred")

    // missing { name }
    expect(i18n._({ id: 'My name is {name}' }))
      .toEqual("Je m'appelle")

    // Untranslated message
    expect(i18n._({ id: 'Missing message' })).toEqual('Missing message')
  })
})

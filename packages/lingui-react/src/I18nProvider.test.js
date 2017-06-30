// @flow
import React from 'react'
import { shallow, mount } from 'enzyme'

import { I18nProvider } from '.'
import { I18nManager } from './I18nProvider'
import { mockConsole } from './mocks'
import linguiDev from './dev'

describe('I18nProvider', function () {
  const props = {
    messages: {
      cs: {
        'All human beings are born free and equal in dignity and rights.': 'Všichni lidé rodí se svobodní a sobě rovní co do důstojnosti a práv.'
      },
      en: {}
    },
    language: 'cs'
  }

  it('should provide context with i18n data', function () {
    const component = shallow(<I18nProvider {...props}>
      <div />
    </I18nProvider>).instance()
    const { subscribe, unsubscribe, i18n } = component.getChildContext()['i18nManager']
    expect(i18n.messages).toEqual(props.messages[props.language])
    expect(i18n.language).toEqual(props.language)
    expect(subscribe).toBeInstanceOf(Function)
    expect(unsubscribe).toBeInstanceOf(Function)
  })

  it('should throw an error on incorrect language', function () {
    mockConsole(console => {
      mount(<I18nProvider language="xyz" messages={{}}><div/></I18nProvider>)
      expect(console.warn).toBeCalledWith(expect.stringContaining('Unknown local'))
    })
  })

  it('should render children', function () {
    const child = <div className="testcase"/>
    expect(shallow(
      <I18nProvider {...props}>{child}</I18nProvider>
    ).contains(child)).toBeTruthy()
  })

  it('should render multiple children wrapped in div', function () {
    expect(shallow(
      <I18nProvider {...props}>
        <span />
        <span />
      </I18nProvider>
    ).find('div').length).toEqual(1)
  })

  it('should notify all subscribers about context change', function () {
    const node = mount(<I18nProvider language="en" messages={{
      en: {},
      cs: {}
    }}>
      <div />
    </I18nProvider>)
    const instance = node.instance()
    const listener = jest.fn()

    // $FlowIgnore - Instance returned from enzyme doesn't have custom attrs
    instance.i18nManager.subscribe(listener)
    expect(listener).not.toBeCalled()

    node.setProps({ language: 'en' })
    expect(listener).not.toBeCalled()

    node.setProps({ language: 'cs' })
    expect(listener).toBeCalled()
  })
})

describe('I18nManager', function () {
  it('should pass active language and messages to underlying I18n class', function () {
    const i18nManager = new I18nManager({
      language: 'en',
      messages: {
        en: { msg: 'hello' },
        fr: { msg: 'salut' }
      },
      development: linguiDev
    })

    expect(i18nManager.i18n.language).toEqual('en')
    expect(i18nManager.i18n.messages).toEqual({ msg: 'hello' })

    i18nManager.update({ language: 'fr' })
    expect(i18nManager.i18n.language).toEqual('fr')
    expect(i18nManager.i18n.messages).toEqual({ msg: 'salut' })

    i18nManager.update({ messages: { fr: { msg: 'salut!' } } })
    expect(i18nManager.i18n.language).toEqual('fr')
    expect(i18nManager.i18n.messages).toEqual({ msg: 'salut!' })

    i18nManager.update({ languageData: { fr: { plurals: () => 'Function' } } })
    expect(i18nManager.i18n.language).toEqual('fr')
    expect(i18nManager.i18n.messages).toEqual({ msg: 'salut!' })
    expect(i18nManager.i18n.languageData.plurals()).toEqual('Function')
  })

  it('should subscribe/unsubscribe listeners for context changes', function () {
    const i18nManager = new I18nManager({
      language: 'en',
      messages: { en: {}, fr: {} }
    })
    const listener = jest.fn()

    expect(i18nManager.subscribers).toEqual([])

    i18nManager.subscribe(listener)
    expect(i18nManager.subscribers).toEqual([listener])

    i18nManager.unsubscribe(listener)
    expect(i18nManager.subscribers).toEqual([])
  })

  it('should notify listeners only when relevant data changes', function () {
    const listener = jest.fn()
    const i18nManager = new I18nManager({
      language: 'en',
      messages: { en: {}, fr: {} },
      development: linguiDev
    })
    i18nManager.subscribe(listener)

    expect(listener).not.toBeCalled()

    i18nManager.update()
    expect(listener).not.toBeCalled()

    i18nManager.update({ completelyDifferentProp: 42 })
    expect(listener).not.toBeCalled()

    i18nManager.update({ language: 'fr' })
    expect(listener).toBeCalled()
    listener.mockReset()

    i18nManager.update({ messages: { en: { id: 'hello' } } })
    expect(listener).toBeCalled()
  })
})

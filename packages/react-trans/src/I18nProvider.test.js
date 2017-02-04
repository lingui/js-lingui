import React from 'react'
import { shallow, mount } from 'enzyme'

import { I18nProvider } from '.'
import { I18n } from './I18nProvider'


describe('I18nProvider', function() {
  const props = {
    messages: {
      'All human beings are born free and equal in dignity and rights.': 'Všichni lidé rodí se svobodní a sobě rovní co do důstojnosti a práv.'
    },
    language: 'cs-cz'
  }

  it('should provide context with i18n data', function() {
    const component = shallow(<I18nProvider {...props}><div /></I18nProvider>).instance()
    const { subscribe, unsubscribe, props: i18nProps } = component.getChildContext()['i18n']
    expect(i18nProps).toEqual(props)
    expect(subscribe).toBeInstanceOf(Function)
    expect(unsubscribe).toBeInstanceOf(Function)
  })

  it('should render children', function() {
    const child = <div className="testcase" />
    expect(shallow(
      <I18nProvider {...props}>{child}</I18nProvider>
    ).contains(child)).toBeTruthy()
  })

  it('should render multiple children wrapped in div', function() {
    expect(shallow(
      <I18nProvider {...props}>
        <span />
        <span />
      </I18nProvider>
    ).find('div').length).toEqual(1)
  })

  it('should notify all subscribers about context change', function() {
    const node = mount(<I18nProvider language="en"><div /></I18nProvider>)
    const instance = node.instance()
    const listener = jest.fn()

    instance.i18n.subscribe(listener)
    expect(listener).not.toBeCalled()

    node.setProps({ language: 'en' })
    expect(listener).not.toBeCalled()

    node.setProps({ language: 'cs' })
    expect(listener).toBeCalled()
  })
})


describe('I18n', function() {
  it('should provide active language and messages', function() {
    const i18n = new I18n({ language: 'en', messages: { msg: 'hello'}})

    expect(i18n.language).toEqual('en')
    expect(i18n.messages).toEqual({ msg: 'hello' })

    i18n.update({ language: 'cs' })
    expect(i18n.language).toEqual('cs')
    expect(i18n.messages).toEqual({ msg: 'hello' })

    i18n.update({ messages: { msg: 'world' }})
    expect(i18n.language).toEqual('cs')
    expect(i18n.messages).toEqual({ msg: 'world'})
  })

  it('should subscribe/unsubscribe listeners for context changes', function() {
    const i18n = new I18n()
    const listener = jest.fn()

    expect(i18n.subscribers).toEqual([])

    i18n.subscribe(listener)
    expect(i18n.subscribers).toEqual([listener])

    i18n.unsubscribe(listener)
    expect(i18n.subscribers).toEqual([])
  })

  it('should notify listeners only when relevant data changes', function() {
    const listener = jest.fn()
    const i18n = new I18n()
    i18n.subscribe(listener)

    expect(listener).not.toBeCalled()

    i18n.update()
    expect(listener).not.toBeCalled()

    i18n.update({ completelyDifferentProp: 42 })
    expect(listener).not.toBeCalled()

    i18n.update({ language: 'en' })
    expect(listener).toBeCalled()
    listener.mockReset()

    i18n.update({ messages: { msg: 'hello' }})
    expect(listener).toBeCalled()
  })
})

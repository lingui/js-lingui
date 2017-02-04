import React from 'react'
import { shallow, mount } from 'enzyme'

import { I18nProvider } from '.'


describe('I18nProvider', function() {
  const props = {
    messages: {
      'All human beings are born free and equal in dignity and rights.': 'Všichni lidé rodí se svobodní a sobě rovní co do důstojnosti a práv.'
    },
    language: 'cs-cz'
  }

  it('should provide context with i18n data', function() {
    const component = shallow(<I18nProvider {...props}><div /></I18nProvider>).instance()
    const { subscribe, unsubscribe, ...context } = component.getChildContext()['i18n']
    expect(context).toEqual(props)
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

  it('should subscribe/unsubscribe listeners for context changes', function() {
    const instance = shallow(<I18nProvider><div /></I18nProvider>).instance()
    const listener = jest.fn()

    expect(instance.subscribers).toEqual([])

    instance.subscribe(listener)
    expect(instance.subscribers).toEqual([listener])

    instance.unsubscribe(listener)
    expect(instance.subscribers).toEqual([])
  })

  it('should notify all subscribers about context change', function() {
    const node = mount(<I18nProvider language="en"><div /></I18nProvider>)
    const instance = node.instance()
    const listener = jest.fn()

    instance.subscribe(listener)
    expect(listener).not.toBeCalled()

    node.setProps({ language: 'en' })
    expect(listener).not.toBeCalled()

    node.setProps({ language: 'cs' })
    expect(listener).toBeCalled()
  })
})

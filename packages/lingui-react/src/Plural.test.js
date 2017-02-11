// @flow
import React from 'react'
import { shallow } from 'enzyme'
import Plural from './Plural'

describe('Plural', function () {
  const languageContext = (code) => ({ context: { i18nManager: { i18n: { language: code } } } })

  it('should render plural correctly', function () {
    const node = shallow(
      <Plural value="1" one="# book" other="# books" />,
      languageContext('en')
    )

    // $FlowIgnore: missing annotation for dive()
    expect(node.dive().text()).toEqual('1 book')

    node.setProps({ value: 2 })
    // $FlowIgnore: missing annotation for dive()
    expect(node.dive().text()).toEqual('2 books')
  })

  it('should use plural forms based on language', function () {
    const node = shallow(
      <Plural value="1" one="# kniha" few="# knihy" other="# knih" />,
      languageContext('cs')
    )

    // $FlowIgnore: missing annotation for dive()
    expect(node.dive().text()).toEqual('1 kniha')

    node.setProps({ value: 2 })
    // $FlowIgnore: missing annotation for dive()
    expect(node.dive().text()).toEqual('2 knihy')

    node.setProps({ value: 5 })
    // $FlowIgnore: missing annotation for dive()
    expect(node.dive().text()).toEqual('5 knih')
  })

  it('should offset value', function () {
    const node = shallow(
      <Plural value="1" offset="1" _1="one" one="one and one another" other="other" />,
      languageContext('en')
    )

    // $FlowIgnore: missing annotation for dive()
    expect(node.dive().text()).toEqual('one')

    node.setProps({ value: 2 })
    // $FlowIgnore: missing annotation for dive()
    expect(node.dive().text()).toEqual('one and one another')

    node.setProps({ value: 3 })
    // $FlowIgnore: missing annotation for dive()
    expect(node.dive().text()).toEqual('other')
  })
})

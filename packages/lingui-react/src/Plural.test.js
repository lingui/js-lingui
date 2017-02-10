import React from 'react'
import { shallow } from 'enzyme'
import { Plural } from '.'

describe('Plural', function () {
  const languageContext = (code) => ({ context: { i18n: { language: code } } })

  it('should render plural correctly', function () {
    const node = shallow(
      <Plural value="1" one="# book" other="# books" />,
      languageContext('en')
    )

    expect(node.dive().text()).toEqual('1 book')

    node.setProps({ value: 2 })
    expect(node.dive().text()).toEqual('2 books')
  })

  it('should use plural forms based on language', function () {
    const node = shallow(
      <Plural value="1" one="# kniha" few="# knihy" other="# knih" />,
      languageContext('cs')
    )

    expect(node.dive().text()).toEqual('1 kniha')

    node.setProps({ value: 2 })
    expect(node.dive().text()).toEqual('2 knihy')

    node.setProps({ value: 5 })
    expect(node.dive().text()).toEqual('5 knih')
  })

  it('should offset value', function () {
    const node = shallow(
      <Plural value="1" offset="1" _1="one" one="one and one another" other="other" />,
      languageContext('en')
    )

    expect(node.dive().text()).toEqual('one')

    node.setProps({ value: 2 })
    expect(node.dive().text()).toEqual('one and one another')

    node.setProps({ value: 3 })
    expect(node.dive().text()).toEqual('other')
  })
})

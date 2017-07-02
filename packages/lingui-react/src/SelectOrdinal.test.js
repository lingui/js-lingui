// @flow
import React from 'react'
import { mount } from 'enzyme'

import { setupI18n } from 'lingui-i18n'
import SelectOrdinal from './SelectOrdinal'
import linguiDev from './dev'

describe('SelectOrdinal', function () {
  const i18n = code => setupI18n({
    language: code,
    messages: {[code]: {}},
    development: linguiDev
  })
  const languageContext = (code) => ({ context: { linguiPublisher: { i18n: i18n(code) } } })

  it('should render ordinal correctly', function () {
    const node = mount(
      <SelectOrdinal value="1" one="#st" two="#nd" few="#rd" other="#th" />,
      languageContext('en')
    )

    const t = () => node.find('Render').text()

    expect(t()).toEqual('1st')

    node.setProps({ value: 2 })
    expect(t()).toEqual('2nd')

    node.setProps({ value: 3 })
    expect(t()).toEqual('3rd')

    node.setProps({ value: 4 })
    expect(t()).toEqual('4th')
  })

  it('should use plural forms based on language', function () {
    // Something Welsh
    // http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html
    const node = mount(
      <SelectOrdinal
        value="0"
        zero="# cŵn"
        one="# ci"
        two="# gi"
        few="# chi"
        many="# chi"
        other="# ci"
      />,
      languageContext('cy')
    )
    const t = () => node.find('Render').text()

    expect(t()).toEqual('0 cŵn')

    node.setProps({ value: 1 })
    expect(t()).toEqual('1 ci')

    node.setProps({ value: 2 })
    expect(t()).toEqual('2 gi')

    node.setProps({ value: 3 })
    expect(t()).toEqual('3 chi')

    node.setProps({ value: 5 })
    expect(t()).toEqual('5 chi')

    node.setProps({ value: 10 })
    expect(t()).toEqual('10 ci')
  })

  it('should use other rule when cardinal ones are missing', function () {
    const node = mount(
      <SelectOrdinal value="1" one="Nope" other="1. křižovatka" />,
      languageContext('cs')
    )

    const t = () => node.find('Render').text()
    expect(t()).toEqual('1. křižovatka')
  })

  it('should offset value', function () {
    const node = mount(
      <SelectOrdinal value="1" offset="1" _0="This one" one="This one and #st" two="This one and #nd" few="This one and #rd" other="This one and #th" />,
      languageContext('en')
    )

    const t = () => node.find('Render').text()
    expect(t()).toEqual('This one')

    node.setProps({ value: 2 })
    expect(t()).toEqual('This one and 1st')

    node.setProps({ value: 3 })
    expect(t()).toEqual('This one and 2nd')

    node.setProps({ value: 4 })
    expect(t()).toEqual('This one and 3rd')

    node.setProps({ value: 5 })
    expect(t()).toEqual('This one and 4th')
  })
})

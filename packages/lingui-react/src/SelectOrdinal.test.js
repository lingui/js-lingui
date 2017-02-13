// @flow
import React from 'react'
import { shallow } from 'enzyme'
import SelectOrdinal from './SelectOrdinal'

describe('SelectOrdinal', function () {
  const languageContext = (code) => ({ context: { i18nManager: { i18n: { language: code } } } })

  it('should render ordinal correctly', function () {
    const node = shallow(
      <SelectOrdinal value="1" one="#st" two="#nd" other="#rd" />,
      languageContext('en')
    )

    // $FlowIgnore: missing annotation for dive()
    expect(node.dive().text()).toEqual('1st')

    node.setProps({ value: 2 })
    // $FlowIgnore: missing annotation for dive()
    expect(node.dive().text()).toEqual('2nd')

    node.setProps({ value: 3 })
    // $FlowIgnore: missing annotation for dive()
    expect(node.dive().text()).toEqual('3rd')
  })

  it('should use plural forms based on language', function () {
    // Something Welsh
    // http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html
    const node = shallow(
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

    // $FlowIgnore: missing annotation for dive()
    expect(node.dive().text()).toEqual('0 cŵn')

    node.setProps({ value: 1 })
    // $FlowIgnore: missing annotation for dive()
    expect(node.dive().text()).toEqual('1 ci')

    node.setProps({ value: 2 })
    // $FlowIgnore: missing annotation for dive()
    expect(node.dive().text()).toEqual('2 gi')

    node.setProps({ value: 3 })
    // $FlowIgnore: missing annotation for dive()
    expect(node.dive().text()).toEqual('3 chi')

    node.setProps({ value: 5 })
    // $FlowIgnore: missing annotation for dive()
    expect(node.dive().text()).toEqual('5 chi')

    node.setProps({ value: 10 })
    // $FlowIgnore: missing annotation for dive()
    expect(node.dive().text()).toEqual('10 ci')
  })

  it('should offset value', function () {
    const node = shallow(
      <SelectOrdinal value="1" offset="1" _0="Himself" one="He and his #st" two="He and his #nd" other="He and his #rd" />,
      languageContext('en')
    )

    // $FlowIgnore: missing annotation for dive()
    expect(node.dive().text()).toEqual('Himself')

    node.setProps({ value: 2 })
    // $FlowIgnore: missing annotation for dive()
    expect(node.dive().text()).toEqual('He and his 1st')

    node.setProps({ value: 3 })
    // $FlowIgnore: missing annotation for dive()
    expect(node.dive().text()).toEqual('He and his 2nd')

    node.setProps({ value: 4 })
    // $FlowIgnore: missing annotation for dive()
    expect(node.dive().text()).toEqual('He and his 3rd')
  })
})

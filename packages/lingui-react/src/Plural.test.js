// @flow
import React from 'react'
import { mount } from 'enzyme'

import { I18n } from 'lingui-i18n'
import Plural from './Plural'

describe('Plural', function () {
  const i18n = code => new I18n(code, {[code]: {}})
  const languageContext = (code) => ({ context: { i18nManager: { i18n: i18n(code) } } })

  it('should render translation inside custom component', function () {
    const html1 = mount(
      <Plural render={<p className="lead"/>} value="1" one="# book" other="# books" />,
      languageContext('en')
    ).find('Render').html()
    const html2 = mount(
      <Plural render={({ translation }) => <p className="lead">{translation}</p>} value="1" one="# book" other="# books" />,
      languageContext('en')
    ).find('Render').html()

    expect(html1).toEqual('<p class="lead">1 book</p>')
    expect(html2).toEqual(html1)
  })

  it('should render plural correctly', function () {
    const node = mount(
      <Plural value="1" one="# book" other="# books" />,
      languageContext('en')
    )

    const t = () => node.find('Render').text()

    expect(t()).toEqual('1 book')

    node.setProps({ value: 2 })
    expect(t()).toEqual('2 books')
  })

  it('should use plural forms based on language', function () {
    const node = mount(
      <Plural value="1" one="# kniha" few="# knihy" other="# knih" />,
      languageContext('cs')
    )

    const t = () => node.find('Render').text()

    expect(t()).toEqual('1 kniha')

    node.setProps({ value: 2 })
    expect(t()).toEqual('2 knihy')

    node.setProps({ value: 5 })
    expect(t()).toEqual('5 knih')
  })

  it('should offset value', function () {
    const node = mount(
      <Plural value="1" offset="1" _1="one" one="one and one another" other="other" />,
      languageContext('en')
    )

    const t = () => node.find('Render').text()

    expect(t()).toEqual('one')

    node.setProps({ value: 2 })
    expect(t()).toEqual('one and one another')

    node.setProps({ value: 3 })
    expect(t()).toEqual('other')
  })
})

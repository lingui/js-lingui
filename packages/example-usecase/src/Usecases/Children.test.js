// @flow
import React from 'react'
import { mount } from 'enzyme'
import { I18nProvider } from 'lingui-react'

import Children from './Children'

describe('Children', function () {
  const messages = {
    en: {},
    cs: {
      'msg.label': 'Nápis',
      'Hello World': 'Ahoj světe',
      'My name is {name}': 'Jmenuji se {name}',
      'Read <0>more</0>': 'Číst <0>dále</0>',
      'Full content of {articleName}': 'Celé znění článku {articleName}'
    }
  }
  const Component = ({ language, ...props }: { language: string }) =>
    <I18nProvider language={language} messages={messages}>
      <Children {...props} />
    </I18nProvider>

  const getText = (element, props = {}) => {
    return mount(
      <Component {...props} language="cs" />).find(element).text()
  }

  const getHtml = (element, props = {}) => {
    return mount(
      <Component {...props} language="cs" />).find(element).html()
  }

  it('should render', function () {
    expect(mount(
      <Component language="cs" />)).toMatchSnapshot()
  })

  it('should render defaults with warning for untranslated', function () {
    expect(getText('.untranslated')).toEqual("This isn't translated")
  })

  it('should support custom message id', function () {
    expect(getText('.customId')).toEqual('Nápis')
  })

  it('should render translated string', function () {
    expect(getText('.translated')).toEqual('Ahoj světe')
  })

  it('should support variable substitution', function () {
    expect(getText('.variable')).toEqual('Jmenuji se Mononoke')
    expect(getText('.variable', { name: 'Fred' })).toEqual('Jmenuji se Fred')
  })

  it('should support nested elements', function () {
    expect(getHtml('.components')).toMatchSnapshot()
  })

  it('should support pluralization', function () {
    expect(getText('.plural'))
      .toEqual('Wilma invites Fred and one other person to her party.')
  })
})

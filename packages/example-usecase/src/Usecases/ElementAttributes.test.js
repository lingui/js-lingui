// @flow
import React from 'react'
import { mount } from 'enzyme'
import { I18nProvider } from 'lingui-react'
import ElementAttributes from './ElementAttributes'

describe('ElementAttributes', function () {
  const messages = {
    en: {},
    cs: {
      'Full content of {articleName}': 'Celý článek {articleName}',
      'Close': 'Zavřít'
    }
  }
  const Component = ({ language }: { language: string }) =>
    <I18nProvider language={language} messages={messages}>
      <ElementAttributes />
    </I18nProvider>

  it('should demostrate i18n in html attributes', function () {
    const node = mount(<Component language="en" />)
    expect(node.find('.expression').prop('title'))
      .toEqual('Full content of Scientific Journal')
    expect(node.find('.variable').prop('aria-label')).toEqual('Close')

    node.setProps({ language: 'cs' })
    expect(node.find('.expression').prop('title'))
      .toEqual('Celý článek Scientific Journal')
    expect(node.find('.variable').prop('aria-label')).toEqual('Zavřít')
  })
})

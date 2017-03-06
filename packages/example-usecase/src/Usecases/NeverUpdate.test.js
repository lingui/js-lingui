import React from 'react'
import { mount } from 'enzyme'
import { I18nProvider } from 'lingui-react'

import NeverUpdate from './NeverUpdate'
import Children from './Children'
import ElementAttributes from './ElementAttributes'

describe('NeverUpdate', function () {
  const messages = {
    cs: {
      'Full content of {articleName}': 'Celý článek {articleName}',
      'Close': 'Zavřít',
      'msg.label': 'Nápis',
      'Hello World': 'Ahoj světe',
      'My name is {name}': 'Jmenuji se {name}',
      'Read <0>more</0>': 'Číst <0>dále</0>'
    }
  }

  const BeConservative = (WrappedComponent) => ({ language }: { language: string}) =>
    <I18nProvider language={language} messages={messages}>
      <NeverUpdate>
        <WrappedComponent />
      </NeverUpdate>
    </I18nProvider>

  it('should update translation when language changes', function () {
    const ConvervativeChildren = BeConservative(Children)

    const node = mount(<ConvervativeChildren language="en" />)
    expect(node.find('.untranslated').text()).toEqual("This isn't translated")
    expect(node.find('.customId').text()).toEqual('msg.label')
    expect(node.find('.translated').text()).toEqual('Hello World')
    expect(node.find('.variable', { name: 'Fred' }).text()).toEqual('My name is Mononoke')

    node.setProps({ language: 'cs' })
    expect(node.find('.untranslated').text()).toEqual("This isn't translated")
    expect(node.find('.customId').text()).toEqual('Nápis')
    expect(node.find('.translated').text()).toEqual('Ahoj světe')
    expect(node.find('.variable').text()).toEqual('Jmenuji se Mononoke')
  })

  it('should update translation when language changes', function () {
    const ConvervativeAttributes = BeConservative(ElementAttributes)

    const node = mount(<ConvervativeAttributes language="en" />)
    expect(node.find('.expression').prop('title'))
      .toEqual('Full content of Scientific Journal')
    expect(node.find('.variable').prop('aria-label')).toEqual('Close')

    node.setProps({ language: 'cs' })
    expect(node.find('.expression').prop('title'))
      .toEqual('Celý článek Scientific Journal')
    expect(node.find('.variable').prop('aria-label')).toEqual('Zavřít')
  })
})

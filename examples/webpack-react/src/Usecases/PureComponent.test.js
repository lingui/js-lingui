// @flow
import * as React from 'react'
import { mount } from 'enzyme'
import { I18nProvider } from 'lingui-react'

import PureComponent from './PureComponent'
import linguiDev from 'lingui-react/dev'

describe('PureComponent', function () {
  const catalogs = {
    en: {},
    cs: {
      messages: {
        'The value is: {value}': 'Hodnota je: {value}'
      }
    }
  }

  const Component = ({ language, value }: { language: string, value: number }) =>
    <I18nProvider language={language} catalogs={catalogs} development={linguiDev}>
      <PureComponent value={value} />
    </I18nProvider>

  const getText = (node, element) => {
    return node.find(element).first().text()
  }

  it('should update translation of children when language changes', function () {
    const node = mount(<Component language="en" value={1} />)
    expect(getText(node, '.valid')).toEqual('The value is: 1')
    expect(getText(node, '.invalid')).toEqual('The value is: 1')
    node.setProps({ value: 11 })
    expect(getText(node, '.valid')).toEqual('The value is: 11')
    expect(getText(node, '.invalid')).toEqual('The value is: 11')

    node.setProps({ language: 'cs' })
    node.update()
    expect(getText(node, '.valid')).toEqual('Hodnota je: 11')
    expect(getText(node, '.invalid')).toEqual('The value is: 11')
  })
})

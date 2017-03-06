// @flow
import React from 'react'
import { mount } from 'enzyme'
import { I18nProvider } from 'lingui-react'

import Formats from './Formats'

describe('Formats', function () {
  const Component = ({ language, ...props }: { language: string }) =>
    <I18nProvider language={language} messages={{}}>
      <Formats {...props} />
    </I18nProvider>

  const getText = (element, props = {}) => {
    return mount(
      <Component {...props} language="cs"/>).find(element).text()
  }

  it('should render', function () {
    expect(mount(
      <Component language="cs"/>)).toMatchSnapshot()
  })

  it('should render percent', function () {
    expect(getText('.percent')).toEqual('The answer is 42 %')
  })

  it('should render date', function () {
    expect(getText('.date')).toEqual('Today is 5. 4. 2017')
  })
})

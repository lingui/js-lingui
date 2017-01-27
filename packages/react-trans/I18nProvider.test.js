import React from 'react'
import { shallow } from 'enzyme'

import { I18nProvider } from '.'


describe('I18nProvider', function() {
  const props = {
    messages: {
      'All human beings are born free and equal in dignity and rights.': 'Všichni lidé rodí se svobodní a sobě rovní co do důstojnosti a práv.'
    },
    language: 'cs-cz'
  }

  it('should provide context with i18n data', function() {
    const component = shallow(<I18nProvider {...props}><div /></I18nProvider>).instance()
    expect(component.getChildContext()['i18n']).toBeDefined()
    expect(component.getChildContext()['i18n']).toEqual(props)
  })

  it('should render children', function() {
    const child = <div className="testcase" />
    expect(shallow(
      <I18nProvider {...props}>{child}</I18nProvider>
    ).contains(child)).toBeTruthy()
  })
})

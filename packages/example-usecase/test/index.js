import React from 'react'
import { mount } from 'enzyme'

import Usecase from '../index'


describe('example-usecase', function() {
  const getText = (element, props = {}) => {
    return mount(<Usecase {...props} />).find(element).text()
  }
  it('should render', function() {
    expect(mount(<Usecase />)).toMatchSnapshot()
  })

  it('should render defaults with warning for untranslated', function() {
    expect(getText('.untranslated')).toEqual('Hello World')
  })

  it.skip('should render translated string', function() {
    expect(getText('.translated')).toEqual('Ahoj světe')
  })

  it.skip('should support variable substitution', function() {
    expect(getText('.translated')).toEqual('Ahoj, jmenuji se Mononoke')
    expect(getText('.translated', { name: 'Fred' })).toEqual('Ahoj, jmenuji se Fred')
  })

  it.skip('should support plural messages in ICU format', function() {

  })
})

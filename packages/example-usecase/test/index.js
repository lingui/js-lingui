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
    expect(getText('.untranslated')).toEqual("This isn't translated")
  })

  it('should support custom message id', function() {
    expect(getText('.customId')).toEqual('Label')
  })

  it('should render translated string', function() {
    expect(getText('.translated')).toEqual('Ahoj světe')
  })

  it('should support variable substitution', function() {
    expect(getText('.variable')).toEqual('Jmenuji se Mononoke')
    expect(getText('.variable', { name: 'Fred' })).toEqual('Jmenuji se Fred')
  })

  it.skip('should support plural messages in ICU format', function() {

  })
})

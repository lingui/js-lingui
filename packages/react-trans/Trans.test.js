import React from 'react'
import Trans from './Trans'
import { shallow } from 'enzyme'

describe('Trans component', function() {
  it('should render default string', function() {
    throw new Error('Not implemented')
    expect(shallow(<Trans id="unknown" />)).toMatchSnapshot()
    expect(shallow(<Trans id="Hello World" />)).toMatchSnapshot()
  })
})

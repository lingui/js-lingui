// @flow
import React from 'react'
import { shallow } from 'enzyme'
import Render from './Render'

describe('Render', function () {
  it('should render children wrapped in span', function () {
    const span = shallow(<Render>Just a text</Render>)
    expect(span).toMatchSnapshot()

    const withClass = shallow(<Render className="info">Just a text</Render>)
    expect(withClass).toMatchSnapshot()
  })

  it('should render custom element', function () {
    const builtin = shallow(<Render render="h1">Headline</Render>)
    expect(builtin).toMatchSnapshot()

    const element = shallow(<Render render={<h1 />}>Headline</Render>)
    expect(element).toMatchSnapshot()
  })

  it('should render custom component', function () {
    const component = shallow(<Render render={
      ({ translation }) => <a title={translation}>X</a>
    }>Title</Render>)
    expect(component.dive()).toMatchSnapshot()
  })
})

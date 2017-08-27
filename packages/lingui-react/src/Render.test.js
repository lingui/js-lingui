// @flow
import React from 'react'
import { shallow } from 'enzyme'
import Render from './Render'

describe('Render', function () {
  it('should render children wrapped in span', function () {
    const span = shallow(<Render value="Just a text" />)
    expect(span).toMatchSnapshot()

    const withClass = shallow(<Render className="info" value="Just a text" />)
    expect(withClass).toMatchSnapshot()
  })

  it('should render custom element', function () {
    const builtin = shallow(<Render render="h1" value="Headline" />)
    expect(builtin).toMatchSnapshot()

    const element = shallow(<Render render={<h1 />} value="Headline" />)
    expect(element).toMatchSnapshot()
  })

  it('should render custom component', function () {
    const component = shallow(<Render value="Title" render={
      ({ translation }) => <a title={translation}>X</a>
    } />)
    expect(component.dive()).toMatchSnapshot()
  })

  it('should take default render element from context', function () {
    const h1 = <h1 />
    const context = {
      linguiDefaultRender: h1
    }

    const span = shallow(<Render value="Just a text" />, { context })
    expect(span).toMatchSnapshot()
  })
})

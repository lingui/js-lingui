// @flow
import React from 'react'
import { shallow } from 'enzyme'
import Render from './Render'

describe('Render', function () {
  it('should render just a text without wrapping element', function () {
    const context = {
      linguiDefaultRender: null
    }
    const ctx = shallow(<Render value="Just a text" />, { context })
    expect(ctx).toMatchSnapshot()

    const span = shallow(<Render render={null} value="Just a text" />)
    expect(span).toMatchSnapshot()

    const withClass = shallow(<Render render={null} className="info" value="Just a text" />)
    expect(withClass).toMatchSnapshot()
  })

  it('should render with fallback span wrapping element', function () {
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

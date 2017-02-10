import React from 'react'
import { shallow } from 'enzyme'
import { formatElements } from './format'

describe('formatElements', function () {
  const html = (elements) => shallow(<span>{elements}</span>).html()
  const wrap = (html) => `<span>${html}</span>`

  it("should return string when there're no elements", function () {
    expect(formatElements('')).toEqual('')
    expect(formatElements('Text only')).toEqual('Text only')
  })

  it('should format unpaired elements', function () {
    expect(html(formatElements('<0/>', [<br />])))
      .toEqual(wrap('<br/>'))
  })

  it('should format paired elements', function () {
    expect(html(formatElements('<0>Inner</0>', [<strong />])))
      .toEqual(wrap('<strong>Inner</strong>'))

    expect(html(formatElements('Before <0>Inner</0> After', [<strong />])))
      .toEqual(wrap('Before <strong>Inner</strong> After'))
  })

  it('should preserve element props', function () {
    expect(html(formatElements('<0>About</0>', [<a href="/about" />])))
      .toEqual(wrap('<a href="/about">About</a>'))
  })

  it('should format nested elements', function () {
    expect(html(formatElements('<0><1>Deep</1></0>', [<a href="/about" />, <strong />])))
      .toEqual(wrap('<a href="/about"><strong>Deep</strong></a>'))

    expect(html(formatElements(
      'Before <0>Inside <1>Nested</1> Between <2/> After</0>',
      [<a href="/about" />, <strong />, <br />]
    ))).toEqual(wrap('Before <a href="/about">Inside <strong>Nested</strong> Between <br/> After</a>'))
  })
})

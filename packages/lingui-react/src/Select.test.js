// @flow
import React from 'react'
import { mount } from 'enzyme'
import { Select } from '.'

describe('Select', function () {
  it('should render translation inside custom component', function () {
    const html1 = mount(
      <Select
        render={<p className="lead"/>}
        value="male" male="He" female="She" other="They" />
    ).find('Render').html()
    const html2 = mount(
      <Select
        render={({ translation }) => <p className="lead">{translation}</p>}
        value="male" male="He" female="She" other="They" />
    ).find('Render').html()

    expect(html1).toEqual('<p class="lead">He</p>')
    expect(html2).toEqual(html1)
  })

  it('should render Select correctly', function () {
    const node = mount(
      <Select value="male" male="He" female="She" other="They" />
    )

    const t = () => node.find('Render').text()

    expect(t()).toEqual('He')

    node.setProps({ value: 'female' })
    expect(t()).toEqual('She')

    node.setProps({ value: 'nan' })
    expect(t()).toEqual('They')
  })
})

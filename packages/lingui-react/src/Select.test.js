import React from 'react'
import { shallow } from 'enzyme'
import { Select } from '.'

describe('Select', function () {
  it('should render Select correctly', function () {
    const node = shallow(<Select value="male" male="He" female="She" other="They" />)

    expect(node.text()).toEqual('He')

    node.setProps({ value: 'female' })
    expect(node.text()).toEqual('She')

    node.setProps({ value: 'nan' })
    expect(node.text()).toEqual('They')
  })
})

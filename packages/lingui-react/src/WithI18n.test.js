import React from 'react'
import { mount } from 'enzyme'

import { WithI18n } from '.'

describe('WithI18n', function () {
  const context = {
    language: 'en',
    messages: {
      msg: 'hello'
    },
    subscribe: jest.fn(),
    unsubscribe: jest.fn()
  }

  // Pass all props to spy on render
  const sinkFactory = (options = {}) => {
    const spy = jest.fn()
    const Sink = WithI18n(options)((props) => {
      spy(props)
      return null
    })
    return { Sink, spy }
  }

  // Mount HOC(sink) and get the props which were passed from HOC
  const mountHoc = (props = {}, hocOptions = {}) => {
    const { Sink, spy } = sinkFactory(hocOptions)
    const node = mount(<Sink {...props} />, { context: { i18n: context } })
    const receivedProps = spy.mock.calls[spy.mock.calls.length - 1][0]

    // Original props are passed with along with i18n prop
    return { node, props: receivedProps }
  }

  beforeEach(() => {
    context.subscribe.mockReset()
    context.unsubscribe.mockReset()
  })

  it('should pass all props to wrapped component', function () {
    const props = {
      foo: 'bar',
      value: 1
    }

    // eslint-disable-next-line no-unused-vars
    const { i18n, ...calledProps } = mountHoc(props).props
    expect(calledProps).toEqual(props)
  })

  it('should provide data from i18n context', function () {
    const { i18n } = mountHoc().props
    expect(i18n).toBeDefined()
    expect(i18n.language).toBeDefined()
    expect(i18n.messages).toBeDefined()
  })

  it('should subscribe a callback on mount', function () {
    expect(context.subscribe).not.toBeCalled()
    mountHoc()
    expect(context.subscribe).toBeCalled()
    expect(context.subscribe.mock.calls[0][0]).toBeInstanceOf(Function)
  })

  it('should unsubscribe a callback on unmount', function () {
    const { node } = mountHoc()

    expect(context.unsubscribe).not.toBeCalled()
    node.unmount()
    expect(context.unsubscribe).toBeCalled()
    expect(context.unsubscribe.mock.calls[0][0]).toBeInstanceOf(Function)
  })

  it("shouldn't subscribe a callback on mount when update is disabled", function () {
    expect(context.subscribe).not.toBeCalled()
    mountHoc({}, { update: false })
    expect(context.subscribe).not.toBeCalled()
  })

  it("shouldn't unsubscribe a callback on unmount when update is disabled", function () {
    const { node } = mountHoc({}, { update: false })

    expect(context.unsubscribe).not.toBeCalled()
    node.unmount()
    expect(context.unsubscribe).not.toBeCalled()
  })
})

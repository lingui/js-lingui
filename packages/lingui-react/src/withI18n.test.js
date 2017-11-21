// @flow
import React from 'react'
import { mount } from 'enzyme'

import { withI18n } from '.'
import { mockEnv, mockConsole } from './mocks'

describe('withI18n', function () {
  const getContext = () => ({
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    i18nHash: 3145,
    i18n: {
      language: 'en',
      messages: {
        msg: 'hello'
      }
    }
  })

  // Pass all props to spy on render
  const sinkFactory = (options = {}) => {
    const spy = jest.fn()
    const Sink = withI18n(options)(class Sink extends React.Component<*> {
      customMethod = () => 42

      render () {
        spy(this.props)
        return <div />
      }
    })
    return { Sink, spy }
  }

  // Mount HOC(sink) and get the props which were passed from HOC
  const mountHoc = (props = {}, hocOptions = {}, context = getContext()) => {
    const { Sink, spy } = sinkFactory(hocOptions)
    const node = mount(<Sink {...props} />, { context: { linguiPublisher: context } })
    const receivedProps = spy.mock.calls[spy.mock.calls.length - 1][0]

    // Original props are passed with along with i18n prop
    return { node, props: receivedProps, context }
  }

  it('should warn if called incorrectly', function () {
    const wrongMount = () => {
      const Component = withI18n(() => <span />)
      // Catch the React error. It will blow up user app, but at least they get
      // the warning about the cause.
      try {
        // $FlowIgnore: This is invalid, that's the point.
        mount(<Component />)
      } catch (e) {}
    }

    mockEnv('production', () => {
      mockConsole(console => {
        wrongMount()
        expect(console.warn).not.toBeCalled()
      })
    })

    mockEnv('development', () => {
      mockConsole(console => {
        wrongMount()
        expect(console.warn).toBeCalledWith(
          expect.stringContaining('withI18n([options]) takes options'))
      })
    })
  })

  it('should pass all props to wrapped component', function () {
    const props = {
      foo: 'bar',
      value: 1
    }

    // eslint-disable-next-line no-unused-vars
    const { i18n, i18nHash, ...calledProps } = mountHoc(props).props
    expect(calledProps).toEqual(props)
  })

  it('should provide data from i18n context', function () {
    const { i18n } = mountHoc().props
    expect(i18n).toBeDefined()
    expect(i18n.language).toBeDefined()
    expect(i18n.messages).toBeDefined()
  })

  it('should subscribe a callback on mount', function () {
    const context = getContext()
    expect(context.subscribe).not.toBeCalled()
    mountHoc({}, {}, context)
    expect(context.subscribe).toBeCalled()
    expect(context.subscribe.mock.calls[0][0]).toBeInstanceOf(Function)
  })

  it('should unsubscribe a callback on unmount', function () {
    const context = getContext()
    const { node } = mountHoc({}, {}, context)

    expect(context.unsubscribe).not.toBeCalled()
    node.unmount()
    expect(context.unsubscribe).toBeCalled()
    expect(context.unsubscribe.mock.calls[0][0]).toBeInstanceOf(Function)
  })

  it("shouldn't subscribe a callback on mount when update is disabled", function () {
    const context = getContext()
    expect(context.subscribe).not.toBeCalled()
    mountHoc({}, { update: false }, context)
    expect(context.subscribe).not.toBeCalled()
  })

  it("shouldn't unsubscribe a callback on unmount when update is disabled", function () {
    const context = getContext()
    const { node } = mountHoc({}, { update: false }, context)

    expect(context.unsubscribe).not.toBeCalled()
    node.unmount()
    expect(context.unsubscribe).not.toBeCalled()
  })

  it('should hold ref to wrapped instance when withRef is enabled', function () {
    const { node } = mountHoc({}, { withRef: true })
    const hoc = node.instance()
    expect(hoc.getWrappedInstance()).not.toBeNull()
    expect(hoc.getWrappedInstance().customMethod).not.toBeNull()
    expect(hoc.getWrappedInstance().customMethod()).toEqual(42)
  })

  it('should not hold ref to wrapped instance when withRef is disabled', function () {
    const { node } = mountHoc()
    expect(() => node.instance().getWrappedInstance()).toThrow(
      'To access the wrapped instance, you need to specify { withRef: true } in the options argument of the withI18n() call.'
    )
  })

  it('should have i18nHash, unless it\'s disabled', function () {
    expect(mountHoc().props.i18nHash).toBeDefined()
    expect(mountHoc({}, { withHash: false }).props.i18nHash).not.toBeDefined()
  })
})

// @flow
import * as React from "react"
import { mount } from "enzyme"

import { setupI18n, withI18n, I18nProvider } from "@lingui/react"

describe("withI18n", function() {
  const mountHoc = (props = {}) => {
    const spy = jest.fn()
    const Sink = withI18n(props => {
      spy(props)
      return null
    })

    const i18n = setupI18n({
      locale: "en"
    })

    const node = mount(
      <I18nProvider i18n={i18n}>
        <Sink {...props} />
      </I18nProvider>
    ).find("Sink")
    const receivedProps = spy.mock.calls[spy.mock.calls.length - 1][0]

    // Original props are passed along with i18n prop
    return { node, props: receivedProps }
  }

  it("should pass all props to wrapped component", function() {
    const props = {
      foo: "bar",
      value: 1
    }

    // eslint-disable-next-line no-unused-vars
    const { i18n, ...calledProps } = mountHoc(props).props
    expect(calledProps).toEqual(props)
  })

  it("should provide data from i18n context", function() {
    const { i18n, ...props } = mountHoc().props
    expect(i18n).toBeDefined()
    expect(i18n.locale).toBeDefined()
    expect(i18n.messages).toBeDefined()
  })

  it("should hoist statics from wrapped component", function() {
    class Component extends React.Component<any, any> {
      static myProp = 24
      static myMethod = () => 42
    }

    const wrapped = withI18n(Component)
    expect(wrapped.myProp).toEqual(24)
    expect(wrapped.myMethod()).toEqual(42)
  })

  it("should hoist statics from wrapped function component", function() {
    function FunctionComponent() {
      return <div />
    }
    FunctionComponent.myProp = 24
    FunctionComponent.myMethod = () => 42

    const wrappedFnComponent = withI18n(FunctionComponent)
    expect(wrappedFnComponent.myProp).toEqual(24)
    expect(wrappedFnComponent.myMethod()).toEqual(42)
  })
})

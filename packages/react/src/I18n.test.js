import * as React from "react"
import { mount } from "enzyme"

import { I18n } from "@lingui/react"

describe("I18n", function() {
  const getContext = () => ({
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    i18nHash: 3145,
    i18n: {
      language: "en",
      messages: {
        msg: "hello"
      }
    }
  })

  it("should render component with i18n props", function() {
    const context = getContext()
    const sink = jest.fn(() => null)

    mount(<I18n>{i18nProps => sink(i18nProps)}</I18n>, {
      context: { linguiPublisher: context }
    })

    expect(sink).toHaveBeenCalledWith({
      i18n: context.i18n,
      i18nHash: context.i18nHash
    })
  })
})

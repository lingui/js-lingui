import * as React from "react"
import { mount } from "enzyme"

import { I18n } from "@lingui/react"
import { mockConsole, mockEnv } from "./mocks"

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

  it("should show deprecation warning for using elements as a children", function() {
    expect.assertions(3)

    mockConsole(console => {
      // Valid
      mount(<I18n>{() => <div />}</I18n>)
      expect(console.warn).not.toHaveBeenCalledWith(
        expect.stringContaining("I18n accepts only function as a children.")
      )
    })

    mockConsole(console => {
      // Deprecated!
      mount(
        <I18n>
          <div />
        </I18n>
      )
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("I18n accepts only function as a children.")
      )
    })

    mockEnv("production", () => {
      jest.resetModules()
      const { I18n } = require("@lingui/react")

      // Deprecated, but not warned in production
      mockConsole(console => {
        mount(
          <I18n>
            <div />
          </I18n>
        )
        expect(console.warn).not.toHaveBeenCalledWith(
          expect.stringContaining("I18n accepts only function as a children.")
        )
      })
    })
  })
})

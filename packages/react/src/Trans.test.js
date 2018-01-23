/* @flow */
import * as React from "react"
import { mount } from "enzyme"

import { Trans } from "@lingui/react"
import { setupI18n } from "@lingui/core"
import { mockEnv, mockConsole } from "./mocks"

describe("Trans component", function() {
  /*
   * Setup context, define helpers
   */
  const i18n = setupI18n({
    language: "en",
    catalogs: {
      en: {
        messages: {
          "All human beings are born free and equal in dignity and rights.":
            "Všichni lidé rodí se svobodní a sobě rovní co do důstojnosti a práv.",
          "My name is {name}": "Jmenuji se {name}",
          Original: "Původní",
          Updated: "Aktualizovaný",
          "msg.currency": "{value, number, currency}"
        }
      }
    }
  })

  const context = { linguiPublisher: { i18n } }
  const text = node =>
    mount(node, { context })
      .find("Render")
      .text()

  /*
   * Tests
   */

  it("shouldn't throw runtime error without i18n context", function() {
    expect(
      mount(<Trans id="unknown" />)
        .find("Render")
        .text()
    ).toEqual("unknown")
  })

  it("should warn about possible missing babel-plugin in development", function() {
    mockEnv("production", () => {
      jest.resetModules()
      const { Trans } = require("@lingui/react")

      mockConsole(console => {
        mount(<Trans>Label</Trans>)
        expect(console.warn).not.toBeCalled()
      })
    })

    mockEnv("development", () => {
      jest.resetModules()
      const { Trans } = require("@lingui/react")

      mockConsole(console => {
        mount(<Trans>Label</Trans>)
        expect(console.warn).toBeCalledWith(
          expect.stringContaining("@lingui/babel-preset-react preset")
        )
      })
    })
  })

  it("should recompile msg when id or defaults changes", function() {
    const node = mount(<Trans id="Original" defaults="Original" />, { context })
    const t = () => node.find("Render").text()
    expect(t()).toEqual("Původní")

    node.setProps({ id: "Updated" })
    expect(t()).toEqual("Aktualizovaný")

    // doesn't affect when different prop is changed
    node.setProps({ other: "other" })
    expect(t()).toEqual("Aktualizovaný")

    // either different id or defaults trigger change
    node.setProps({ id: "Unknown" })
    expect(t()).toEqual("Original")
    node.setProps({ defaults: "Unknown" })
    expect(t()).toEqual("Unknown")
  })

  it("should render default string", function() {
    expect(text(<Trans id="unknown" />)).toEqual("unknown")

    expect(text(<Trans id="unknown" defaults="Not translated yet" />)).toEqual(
      "Not translated yet"
    )

    expect(
      text(
        <Trans
          id="unknown"
          defaults="Not translated yet, {name}"
          values={{ name: "Dave" }}
        />
      )
    ).toEqual("Not translated yet, Dave")
  })

  it("should render translation", function() {
    const translation = text(
      <Trans id="All human beings are born free and equal in dignity and rights." />
    )

    expect(translation).toEqual(
      "Všichni lidé rodí se svobodní a sobě rovní co do důstojnosti a práv."
    )
  })

  it("should render translation from variable", function() {
    const msg =
      "All human beings are born free and equal in dignity and rights."
    const translation = text(<Trans id={msg} />)
    expect(translation).toEqual(
      "Všichni lidé rodí se svobodní a sobě rovní co do důstojnosti a práv."
    )
  })

  it("should render translation inside custom component", function() {
    const html1 = mount(
      <Trans render={<p className="lead" />} id="Original" />,
      { context }
    )
      .find("Render")
      .html()
    const html2 = mount(
      <Trans
        render={({ translation }) => <p className="lead">{translation}</p>}
        id="Original"
      />,
      { context }
    )
      .find("Render")
      .html()

    expect(html1).toEqual('<p class="lead">Původní</p>')
    expect(html2).toEqual(html1)
  })

  it("should render custom format", function() {
    const translation = text(
      <Trans
        id="msg.currency"
        values={{ value: 1 }}
        formats={{
          currency: {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 2
          }
        }}
      />
    )
    expect(translation).toEqual("€1.00")
  })
})

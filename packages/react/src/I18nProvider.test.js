// @flow
import * as React from "react"
import { mount } from "enzyme"

import { setupI18n } from "@lingui/core"
import { I18nProvider, I18n, Trans } from "@lingui/react"

describe("I18nProvider", function() {
  it("should subscribe for locale changes", function() {
    const i18n = setupI18n()
    i18n.onActivate = jest.fn()

    expect(i18n.onActivate).not.toBeCalled()
    mount(
      <I18nProvider i18n={i18n}>
        <div />
      </I18nProvider>
    )
    expect(i18n.onActivate).toBeCalled()
  })

  it("should unsubscribe for locale changes on unmount", function() {
    const unsubscribe = jest.fn()
    const i18n = setupI18n()
    i18n.onActivate = jest.fn(() => unsubscribe)

    const node = mount(
      <I18nProvider i18n={i18n}>
        <div />
      </I18nProvider>
    )
    expect(unsubscribe).not.toBeCalled()
    node.unmount()
    expect(unsubscribe).toBeCalled()
  })

  it("should re-render on locale changes", function() {
    const i18n = setupI18n({
      language: "en",
      catalogs: {
        en: {},
        cs: {}
      }
    })

    const node = mount(
      <I18nProvider i18n={i18n}>
        <I18n>{({ i18n }) => i18n.language}</I18n>
      </I18nProvider>
    )
    expect(node.text()).toEqual("en")

    i18n.activate("cs")
    expect(node.text()).toEqual("cs")
  })

  it("should render children", function() {
    const i18n = setupI18n()
    const child = <div className="testcase" />
    expect(
      mount(<I18nProvider i18n={i18n}>{child}</I18nProvider>).contains(child)
    ).toBeTruthy()
  })

  it("shouldn't render multiple children wrapped in div", function() {
    const i18n = setupI18n()
    expect(
      mount(
        <I18nProvider i18n={i18n}>
          <span />
          <span />
        </I18nProvider>
      ).find("div")
    ).toHaveLength(0)
  })

  it("should render custom message for missing translation", function() {
    const i18n = setupI18n({ missing: "xxx" })
    const missing = mount(
      <I18nProvider i18n={i18n}>
        <Trans id="missing" />
      </I18nProvider>
    ).text()
    expect(missing).toEqual("xxx")
  })
})

import * as React from "react"
import { render, act } from "react-testing-library"

import { I18nProvider, useLingui } from "@lingui/react"
import { setupI18n } from "@lingui/core"

describe("I18nProvider", function() {
  it("should subscribe for locale changes", function() {
    const i18n = setupI18n()
    i18n.on = jest.fn(() => jest.fn())

    expect(i18n.on).not.toBeCalled()
    render(
      <I18nProvider i18n={i18n}>
        <div />
      </I18nProvider>
    )
    expect(i18n.on).toBeCalledWith("activate", expect.anything())
  })

  it("should unsubscribe for locale changes on unmount", function() {
    const unsubscribe = jest.fn()
    const i18n = setupI18n()
    i18n.on = jest.fn(() => unsubscribe)

    const { unmount } = render(
      <I18nProvider i18n={i18n}>
        <div />
      </I18nProvider>
    )
    expect(unsubscribe).not.toBeCalled()
    unmount()
    expect(unsubscribe).toBeCalled()
  })

  it("should re-render on locale changes", function() {
    const i18n = setupI18n({
      locale: "en",
      catalogs: {}
    })

    function RenderLocale() {
      const { i18n } = useLingui()
      return i18n.locale as null
    }

    const { container } = render(
      <I18nProvider i18n={i18n}>
        <RenderLocale />
      </I18nProvider>
    )
    expect(container.textContent).toEqual("en")

    act(() => {
      i18n.activate("cs")
    })
    expect(container.textContent).toEqual("cs")
  })

  it("should render children", function() {
    const i18n = setupI18n({
      locale: "en"
    })

    const child = <div data-testid="child" />
    const { getByTestId } = render(
      <I18nProvider i18n={i18n}>{child}</I18nProvider>
    )
    expect(getByTestId("child")).toBeTruthy()
  })

  it("shouldn't render children if locales aren't loaded", function() {
    const i18n = setupI18n()

    const child = <div data-testid="child" />
    const { queryByTestId } = render(
      <I18nProvider i18n={i18n}>{child}</I18nProvider>
    )
    expect(queryByTestId("child")).toBeFalsy()
  })
})

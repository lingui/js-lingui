import * as React from "react"
import { act, render } from "@testing-library/react"

import { withI18n, I18nProvider } from "./I18nProvider"
import { setupI18n } from "@lingui/core"

describe("I18nProvider", () => {
  it("should pass i18n context to wrapped component", () => {
    const i18n = setupI18n({
      locale: "cs",
    })

    const WithoutHoc = (props) => {
      return <div {...props}>{props?.i18n?.locale}</div>
    }

    const WithHoc = withI18n()(WithoutHoc)

    const { getByTestId } = render(
      <I18nProvider i18n={i18n}>
        <WithoutHoc data-testid="not-composed" />
        <WithHoc data-testid="composed" />
      </I18nProvider>
    )

    act(() => {
      i18n.load("cs", {})
      i18n.activate("cs")
    })

    expect(getByTestId("not-composed").textContent).toEqual("")
    expect(getByTestId("composed").textContent).toEqual("cs")
  })

  it("should subscribe for locale changes", () => {
    const i18n = setupI18n()
    i18n.on = jest.fn(() => jest.fn())

    expect(i18n.on).not.toBeCalled()
    render(
      <I18nProvider i18n={i18n}>
        <div />
      </I18nProvider>
    )
    expect(i18n.on).toBeCalledWith("change", expect.anything())
  })

  it("should unsubscribe for locale changes on unmount", () => {
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

  it("should re-render on locale changes", async () => {
    expect.assertions(3)

    const i18n = setupI18n()

    const CurrentLocale = () => {
      return <span>{i18n.locale}</span>
    }

    const { container } = render(
      <I18nProvider i18n={i18n}>
        <CurrentLocale />
      </I18nProvider>
    )
    // First render — no output, because locale isn't activated
    expect(container.textContent).toEqual("")

    act(() => {
      i18n.load("en", {})
    })
    // Again, no output. Catalog is loaded, but locale
    // still isn't activated.
    expect(container.textContent).toEqual("")

    act(() => {
      i18n.load("cs", {})
      i18n.activate("cs")
    })
    // After loading and activating locale, it's finally rendered.
    expect(container.textContent).toEqual("cs")
  })

  it("should render children", () => {
    const i18n = setupI18n({
      locale: "en",
    })

    const child = <div data-testid="child" />
    const { getByTestId } = render(
      <I18nProvider i18n={i18n}>{child}</I18nProvider>
    )
    expect(getByTestId("child")).toBeTruthy()
  })
})

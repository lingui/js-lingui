import * as React from "react"
import { render } from "@testing-library/react"

import { I18nProvider } from "@lingui/react"
import { I18n } from "@lingui/core"

describe("I18nProvider", function() {
  it("should render children", function() {
    const i18n = new I18n({
      locale: "en"
    })

    const child = <div data-testid="child" />
    const { getByTestId } = render(
      <I18nProvider i18n={i18n}>{child}</I18nProvider>
    )
    expect(getByTestId("child")).toBeTruthy()
  })

  it("shouldn't render children if locales aren't loaded", function() {
    const i18n = new I18n()

    const child = <div data-testid="child" />
    const { queryByTestId } = render(
      <I18nProvider i18n={i18n}>{child}</I18nProvider>
    )
    expect(queryByTestId("child")).toBeFalsy()
  })
})

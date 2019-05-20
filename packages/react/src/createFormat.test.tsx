import * as React from "react"
import { render } from "react-testing-library"

import { I18nProvider, DateFormat, NumberFormat } from "@lingui/react"
import { setupI18n } from "@lingui/core"

const text = (element, locale, locales?: string[] | string) => {
  const i18n = setupI18n({
    locale,
    locales
  })
  return render(<I18nProvider i18n={i18n}>{element}</I18nProvider>).container
    .textContent
}

describe("DateFormat", function() {
  it("should render", function() {
    const nowStr = "2017-06-17:14:00.000Z"
    const now = new Date(nowStr)
    const [day, month, year] = [
      now.getDate(),
      now.getMonth() + 1,
      now.getFullYear()
    ]
    const expectedDate = `${month}/${day}/${year}`

    const dateString = text(<DateFormat value={nowStr} />, "en")
    expect(dateString).toEqual(expectedDate)

    const dateObj = text(<DateFormat value={now} />, "en")
    expect(dateObj).toEqual(expectedDate)
  })

  it("should render using the given locales", function() {
    const now = new Date("2017-06-17:14:00.000Z")
    const rendered = text(<DateFormat value={now} />, "en", "fr-FR")
    expect(rendered).toEqual("17/06/2017")
  })

  it("should render using the first recognized locale", function() {
    const now = new Date("2017-06-17:14:00.000Z")
    const rendered = text(<DateFormat value={now} />, "en", [
      "unknown-locale",
      "fr-FR"
    ])
    expect(rendered).toEqual("17/06/2017")
  })
})

describe("NumberFormat", function() {
  it("should render", function() {
    const rendered = text(
      <NumberFormat
        value={42}
        format={{
          style: "currency",
          currency: "EUR",
          minimumFractionDigits: 2
        }}
      />,
      "en"
    )
    expect(rendered).toEqual("€42.00")
  })

  it("should render using the given locales", function() {
    const rendered = text(
      <NumberFormat
        value={42000}
        format={{
          style: "currency",
          currency: "EUR",
          minimumFractionDigits: 2
        }}
      />,
      "en",
      "de-DE"
    )
    expect(rendered).toEqual("42.000,00 €")
  })

  it("should render using the first recognized locale", function() {
    const rendered = text(
      <NumberFormat
        value={42000}
        format={{
          style: "currency",
          currency: "EUR",
          minimumFractionDigits: 2
        }}
      />,
      "en",
      ["unknown-locale", "de-DE"]
    )
    expect(rendered).toEqual("42.000,00 €")
  })
})

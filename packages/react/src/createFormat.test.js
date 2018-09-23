// @flow
import * as React from "react"
import { mount } from "enzyme"

import { setupI18n } from "@lingui/core"
import { I18nProvider, DateFormat, NumberFormat } from "@lingui/react"

const text = (element, language, locales) => {
  const i18n = setupI18n({
    language,
    locales
  })
  return mount(<I18nProvider i18n={i18n}>{element}</I18nProvider>).text()
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
    const dateObj = text(<DateFormat value={now} />, "en")
    expect(dateObj).toEqual(expectedDate)

    const dateString = text(<DateFormat value={nowStr} />, "en")
    expect(dateString).toEqual(expectedDate)
  })

  it("should render using the given locales", function() {
    const now = new Date("2017-06-17:14:00.000Z")
    const node = text(<DateFormat value={now} />, "en", "fr-FR")
    expect(node).toEqual("17/06/2017")
  })

  it("should render using the first recognized locale", function() {
    const now = new Date("2017-06-17:14:00.000Z")
    const node = text(<DateFormat value={now} />, "en", [
      "unknown-locale",
      "fr-FR"
    ])
    expect(node).toEqual("17/06/2017")
  })
})

describe("NumberFormat", function() {
  it("should render", function() {
    const node = text(
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
    expect(node).toEqual("€42.00")
  })

  it("should render using the given locales", function() {
    const node = text(
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
    expect(node).toEqual("42.000,00 €")
  })

  it("should render using the first recognized locale", function() {
    const node = text(
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
    expect(node).toEqual("42.000,00 €")
  })
})

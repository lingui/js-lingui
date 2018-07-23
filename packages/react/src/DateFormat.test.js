// @flow
import * as React from "react"
import { mount } from "enzyme"

import { DateFormat, NumberFormat } from "@lingui/react"

describe("DateFormat", function() {
  const languageContext = (language, locales) => ({
    context: {
      linguiPublisher: {
        i18n: {
          language: language,
          locales: locales
        }
      }
    }
  })

  it("should render", function() {
    const nowStr = "2017-06-17:14:00.000Z"
    const now = new Date(nowStr)
    const [day, month, year] = [
      now.getDate(),
      now.getMonth() + 1,
      now.getFullYear()
    ]
    const expectedDate = `${month}/${day}/${year}`
    const dateObj = mount(
      <DateFormat value={now} />,
      languageContext("en")
    ).find("Render")
    expect(dateObj.text()).toEqual(expectedDate)

    const dateString = mount(
      <DateFormat value={nowStr} />,
      languageContext("en")
    ).find("Render")
    expect(dateString.text()).toEqual(expectedDate)
  })

  it("should render using the given locales", function() {
    const now = new Date("2017-06-17:14:00.000Z")
    const node = mount(
      <DateFormat value={now} />,
      languageContext("en", "fr-FR")
    ).find("Render")
    expect(node.text()).toEqual("17/06/2017")
  })

  it("should render using the first recognized locale", function() {
    const now = new Date("2017-06-17:14:00.000Z")
    const node = mount(
      <DateFormat value={now} />,
      languageContext("en", ["unknown-locale", "fr-FR"])
    ).find("Render")
    expect(node.text()).toEqual("17/06/2017")
  })

  it("should render translation inside custom component", function() {
    const now = new Date("2017-06-17:14:00.000Z")
    const [day, month, year] = [
      now.getDate(),
      now.getMonth() + 1,
      now.getFullYear()
    ]
    const expectedDate = `${month}/${day}/${year}`
    const html1 = mount(
      <DateFormat value={now} render={<p className="lead" />} />,
      languageContext("en")
    )
      .find("Render")
      .html()
    const html2 = mount(
      <DateFormat
        value={now}
        render={({ translation }) => <p className="lead">{translation}</p>}
      />,
      languageContext("en")
    )
      .find("Render")
      .html()

    expect(html1).toEqual(`<p class="lead">${expectedDate}</p>`)
    expect(html2).toEqual(html1)
  })
})

describe("NumberFormat", function() {
  const languageContext = (language, locales) => ({
    context: {
      linguiPublisher: { i18n: { language: language, locales: locales } }
    }
  })

  it("should render", function() {
    const node = mount(
      <NumberFormat
        value={42}
        format={{
          style: "currency",
          currency: "EUR",
          minimumFractionDigits: 2
        }}
      />,
      languageContext("en")
    ).find("Render")
    expect(node.text()).toEqual("€42.00")
  })

  it("should render using the given locales", function() {
    const node = mount(
      <NumberFormat
        value={42000}
        format={{
          style: "currency",
          currency: "EUR",
          minimumFractionDigits: 2
        }}
      />,
      languageContext("en", "de-DE")
    ).find("Render")
    expect(node.text()).toEqual("42.000,00 €")
  })

  it("should render using the first recognized locale", function() {
    const node = mount(
      <NumberFormat
        value={42000}
        format={{
          style: "currency",
          currency: "EUR",
          minimumFractionDigits: 2
        }}
      />,
      languageContext("en", ["unknown-locale", "de-DE"])
    ).find("Render")
    expect(node.text()).toEqual("42.000,00 €")
  })

  it("should render translation inside custom component", function() {
    const format = {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2
    }

    const html1 = mount(
      <NumberFormat
        value="42"
        format={format}
        render={<p className="lead" />}
      />,
      languageContext("en")
    )
      .find("Render")
      .html()
    const html2 = mount(
      <NumberFormat
        value="42"
        format={format}
        render={({ translation }) => <p className="lead">{translation}</p>}
      />,
      languageContext("en")
    )
      .find("Render")
      .html()

    expect(html1).toEqual('<p class="lead">€42.00</p>')
    expect(html2).toEqual(html1)
  })
})

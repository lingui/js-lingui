import * as React from "react"
import { render } from "@testing-library/react"
import { formatElements } from "./format"
// eslint-disable-next-line import/no-extraneous-dependencies
import { mockConsole } from "@lingui/jest-mocks"

describe("formatElements", function () {
  const html = (elements: React.ReactNode) =>
    render(elements as React.ReactElement).container.innerHTML

  it("should return string when there are no elements", function () {
    expect(formatElements("")).toEqual("")
    expect(formatElements("Text only")).toEqual("Text only")
  })

  it("should format unpaired elements", function () {
    expect(html(formatElements("<0/>", { 0: <br /> }))).toEqual("<br>")
  })

  it("should format paired elements", function () {
    expect(html(formatElements("<0>Inner</0>", { 0: <strong /> }))).toEqual(
      "<strong>Inner</strong>"
    )

    expect(
      html(formatElements("Before <0>Inner</0> After", { 0: <strong /> }))
    ).toEqual("Before <strong>Inner</strong> After")
  })

  it("should preserve element props", function () {
    expect(
      html(formatElements("<0>About</0>", { 0: <a href="/about" /> }))
    ).toEqual('<a href="/about">About</a>')
  })

  it("should preserve named element props", function () {
    expect(
      html(
        formatElements("<named>About</named>", { named: <a href="/about" /> })
      )
    ).toEqual('<a href="/about">About</a>')
  })

  it("should preserve nested named element props", function () {
    expect(
      html(
        formatElements("<named>About <b>us</b></named>", {
          named: <a href="/about" />,
          b: <strong />,
        })
      )
    ).toEqual('<a href="/about">About <strong>us</strong></a>')
  })

  it("should format nested elements", function () {
    expect(
      html(
        formatElements("<0><1>Deep</1></0>", {
          0: <a href="/about" />,
          1: <strong />,
        })
      )
    ).toEqual('<a href="/about"><strong>Deep</strong></a>')

    expect(
      html(
        formatElements(
          "Before \n<0>Inside <1>\nNested</1>\n Between <2/> After</0>",
          { 0: <a href="/about" />, 1: <strong />, 2: <br /> }
        )
      )
    ).toEqual(
      'Before <a href="/about">Inside <strong>Nested</strong> Between <br> After</a>'
    )
  })

  it("should ignore non existing element", function () {
    mockConsole((console) => {
      expect(html(formatElements("<0>First</0>"))).toEqual("First")
      expect(html(formatElements("<0>First</0>Second"))).toEqual("FirstSecond")
      expect(html(formatElements("First<0>Second</0>Third"))).toEqual(
        "FirstSecondThird"
      )
      expect(html(formatElements("Fir<0/>st"))).toEqual("First")
      expect(html(formatElements("<tag>text</tag>"))).toEqual("text")
      expect(html(formatElements("text <br/>"))).toEqual("text ")

      expect(console.warn).not.toBeCalled()
      expect(console.error).toBeCalledTimes(6)
    })
  })

  it("should ignore incorrect tags and print them as a text", function () {
    mockConsole((console) => {
      expect(html(formatElements("text</0>"))).toEqual("text&lt;/0&gt;")
      expect(html(formatElements("text<0 />"))).toEqual("text&lt;0 /&gt;")

      expect(console.warn).not.toBeCalled()
      expect(console.error).not.toBeCalled()
    })
  })

  it("should ignore unpaired element used as paired", function () {
    mockConsole((console) => {
      expect(html(formatElements("<0>text</0>", { 0: <br /> }))).toEqual("text")

      expect(console.warn).not.toBeCalled()
      expect(console.error).toBeCalled()
    })
  })

  it("should ignore unpaired named element used as paired", function () {
    mockConsole((console) => {
      expect(
        html(formatElements("<named>text</named>", { named: <br /> }))
      ).toEqual("text")

      expect(console.warn).not.toBeCalled()
      expect(console.error).toBeCalledTimes(1)
    })
  })

  it("should ignore paired element used as unpaired", function () {
    expect(html(formatElements("text<0/>", { 0: <span /> }))).toEqual(
      "text<span></span>"
    )
  })

  it("should ignore paired named element used as unpaired", function () {
    expect(html(formatElements("text<named/>", { named: <span /> }))).toEqual(
      "text<span></span>"
    )
  })

  it("should create two children with different keys", function () {
    const cleanPrefix = (str: string): number =>
      Number.parseInt(str.replace("$lingui$_", ""), 10)
    const elements = formatElements("<div><0/><0/></div>", {
      div: <div />,
      0: <span>hi</span>,
    }) as Array<React.ReactElement>

    expect(elements).toHaveLength(1)
    const childElements = elements[0]!.props.children
    const childKeys = childElements
      .map((el: React.ReactElement) => el?.key)
      .filter(Boolean)
    expect(cleanPrefix(childKeys[0])).toBeLessThan(cleanPrefix(childKeys[1]))
  })
})

import { render } from "@testing-library/react"
import * as React from "react"
import { formatElements } from "./format"
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

  it("should preserve newlines", function () {
    expect(html(formatElements("<0>Inn\ner</0>", { 0: <strong /> }))).toEqual(
      "<strong>Inn\ner</strong>"
    )

    expect(
      html(formatElements("Before <0>Inn\r\ner</0> After", { 0: <strong /> }))
    ).toEqual("Before <strong>Inn\r\ner</strong> After")

    expect(
      html(formatElements("<0>Ab\rout</0>", { 0: <a href="/about" /> }))
    ).toEqual('<a href="/about">Ab\rout</a>')
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
      'Before \n<a href="/about">Inside <strong>\nNested</strong>\n Between <br> After</a>'
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
    })

    expect(React.isValidElement(elements)).toBe(true)

    const childElements = (
      elements as React.ReactElement<{ children: React.ReactElement[] }>
    ).props.children
    const childKeys = childElements.map((el) => el?.key).filter(Boolean)

    expect(cleanPrefix(childKeys[0] as string)).toBeLessThan(
      cleanPrefix(childKeys[1] as string)
    )
  })

  it("should handle array of elements", function () {
    const arrayOfElements = [
      <span key="1">First</span>,
      <span key="2">Second</span>,
    ]
    expect(
      html(
        formatElements("<0/>", {
          0: arrayOfElements as unknown as React.ReactElement,
        })
      )
    ).toEqual("<span>First</span><span>Second</span>")
  })
})

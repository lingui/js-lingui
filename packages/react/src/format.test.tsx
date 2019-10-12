import * as React from "react"
import { render } from "@testing-library/react"
import { formatElements } from "./format"

describe("formatElements", function() {
  const html = elements => render(elements).container.innerHTML

  it("should return string when there're no elements", function() {
    expect(formatElements("")).toEqual("")
    expect(formatElements("Text only")).toEqual("Text only")
  })

  it("should format unpaired elements", function() {
    expect(html(formatElements("<0/>", { 0: <br /> }))).toEqual("<br>")
  })

  it("should format paired elements", function() {
    expect(html(formatElements("<0>Inner</0>", { 0: <strong /> }))).toEqual(
      "<strong>Inner</strong>"
    )

    expect(
      html(formatElements("Before <0>Inner</0> After", { 0: <strong /> }))
    ).toEqual("Before <strong>Inner</strong> After")
  })

  it("should preserve element props", function() {
    expect(
      html(formatElements("<0>About</0>", { 0: <a href="/about" /> }))
    ).toEqual('<a href="/about">About</a>')
  })

  it("should format nested elements", function() {
    expect(
      html(
        formatElements("<0><1>Deep</1></0>", {
          0: <a href="/about" />,
          1: <strong />
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
})

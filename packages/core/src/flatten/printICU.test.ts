import { parse } from "@messageformat/parser"
import { printICU } from "./printICU"

describe("printICU", () => {
  it("should properly escape strings", () => {
    expect(printICU(parse("'This name {name} is banned'"))).toEqual(
      "'This name {name} is banned'"
    )
    expect(printICU(parse("'Your name is: ''{name}''."))).toEqual(
      "'Your name is: ''{name}''."
    )
    expect(
      printICU(
        parse(
          "My brother {brotherName} is taller than {friendName} who is Peter's friend."
        )
      )
    ).toEqual(
      "My brother {brotherName} is taller than {friendName} who is Peter's friend."
    )
  })

  it("should print parameters correctly", () => {
    expect(printICU(parse("{var,date, y-M-d HH:mm:ss zzzz}"))).toEqual(
      "{var, date, y-M-d HH:mm:ss zzzz}"
    )
  })

  it("should print variable correctly", () => {
    expect(printICU(parse("Hello {name}"))).toEqual("Hello {name}")
  })

  it("should print parameters with variable correctly", () => {
    expect(printICU(parse("{foo, date, {bar}}"))).toEqual("{foo, date, {bar}}")
  })

  it("should print without whitespace before variable", () => {
    expect(printICU(parse("{foo, date,     {bar}}"))).toEqual(
      "{foo, date, {bar}}"
    )
  })

  it("should print parameters with select correctly", () => {
    expect(printICU(parse("{foo, date,{bar, select, other{baz}}}"))).toEqual(
      "{foo, date, {bar, select, other {baz}}}"
    )
  })

  it("should print plural with offset correctly", () => {
    expect(printICU(parse("{foo, plural, offset:4 other{baz}}"))).toEqual(
      "{foo, plural, offset:4 other {baz}}"
    )
  })

  it("should print plural with exact forms correctly", () => {
    expect(
      printICU(parse("{foo, plural,=0{e0} =1{e1} =2{e2} other{baz}}"))
    ).toEqual("{foo, plural, =0 {e0} =1 {e1} =2 {e2} other {baz}}")
  })
})

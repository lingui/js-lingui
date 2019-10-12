describe("vanilla-js example", function() {
  describe("messages as ids", function() {
    test(require("./messages"))
  })

  describe("custom ids", function() {
    test(require("./ids"))
  })
})

function test({ activate, getStatic, getVariables, getPlural, getLazy }) {
  it("should translate static message", function() {
    activate("en")
    expect(getStatic()).toEqual("@lingui/core example")
    activate("cs")
    expect(getStatic()).toEqual("Ukázka @lingui/core")
  })

  it("should translate message with varibles", function() {
    activate("en")
    expect(getVariables("Joe")).toEqual("Hello Joe")
    activate("cs")
    expect(getVariables("Joe")).toEqual("Ahoj Joe")
  })

  it("should translate message with plurals", function() {
    activate("en")
    expect(getPlural(1)).toEqual("There are 1 bottle hanging on the wall")
    expect(getPlural(2)).toEqual("There are 2 bottles hanging on the wall")
    activate("cs")
    expect(getPlural(1)).toEqual("1 láhev visí na stěně")
    expect(getPlural(2)).toEqual("2 láhve visí na stěně")
    expect(getPlural(5)).toEqual("5 láhví visí na stěně")
  })

  it("should translate messages lazily", function() {
    activate("en")
    expect(getLazy()).toEqual("Do you want to proceed? Yes/No")
    activate("cs")
    expect(getLazy()).toEqual("Chcete pokračovat? Ano/Ne")
  })
}

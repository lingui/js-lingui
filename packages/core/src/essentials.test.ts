import { isString, isFunction } from "./essentials"

describe("isString", function() {
  it("should check string", function() {
    expect(isString("Hello")).toBeTruthy()
    expect(isString(42)).toBeFalsy()
    expect(isString([42])).toBeFalsy()
  })
})

describe("isFunction", function() {
  it("should check function", function() {
    expect(isFunction(function() {})).toBeTruthy()
    expect(isFunction(() => {})).toBeTruthy()
    expect(isFunction("Nope")).toBeFalsy()
  })
})

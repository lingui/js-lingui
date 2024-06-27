import { normalizePlaceholderValue } from "./utils"

describe("normalizePlaceholderValue", () => {
  it.each([
    `user 
    ? user.name 
    : null`,
    "userName",
  ])("Should normalize whitespaces", (input) => {
    expect(normalizePlaceholderValue(input)).toMatchSnapshot()
  })
})

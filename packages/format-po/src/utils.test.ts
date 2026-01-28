import { formatPotCreationDate, normalizePlaceholderValue } from "./utils"

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

describe("formatPotCreationDate", () => {
  it('Should format date in `xgettext` compatible format "%Y-%m-%d %H:%M%z"', (input) => {
    expect(
      formatPotCreationDate(new Date("2018-08-27T10:00Z")),
    ).toMatchInlineSnapshot(`"2018-08-27 10:00+0000"`)
  })
})

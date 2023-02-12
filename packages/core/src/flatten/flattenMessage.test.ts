import { mockConsole } from "@lingui/jest-mocks"
import { flattenMessage as flatten } from "./flattenMessage"

describe("flatten", () => {
  it("should flatten selectordinal", () => {
    const message = flatten(
      "It's my dog's {year, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} birthday!"
    )
    expect(message).toEqual(
      "{year, selectordinal, one {It's my dog's #st birthday!} two {It's my dog's #nd birthday!} few {It's my dog's #rd birthday!} other {It's my dog's #th birthday!}}"
    )
  })

  it("should flatten plural", () => {
    const message = flatten(
      "I have {value, plural, one {{value} book} other {# books}}"
    )
    expect(message).toEqual(
      "{value, plural, one {I have {value} book} other {I have # books}}"
    )
  })

  it("should flatten select with a placeholder in a previous sentence", () => {
    const message = flatten(
      "Hello, Your friend {friend} is now online. {gender, select, female {She} male {He} other {They}} added a new image!"
    )
    expect(message).toEqual(
      "{gender, select, female {Hello, Your friend {friend} is now online. She added a new image!} male {Hello, Your friend {friend} is now online. He added a new image!} other {Hello, Your friend {friend} is now online. They added a new image!}}"
    )
  })

  it("should flatten plural with number", () => {
    const message = flatten(
      "You have {count, plural, one {{count, number} dog} other {{count, number} dogs}}"
    )
    expect(message).toEqual(
      "{count, plural, one {You have {count, number} dog} other {You have {count, number} dogs}}"
    )
  })

  it("should throw error for invalid ICU message", () => {
    mockConsole((console) => {
      flatten("{foo, plural, =a{e1} other{baz}}")

      expect(console.error).toBeCalledWith(
        expect.stringContaining(`invalid syntax`)
      )
    })
  })
})

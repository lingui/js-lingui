import ICUMessageFormat from "./icu"

describe("ICU MessageFormat", function () {
  it("should collect text message", function () {
    const messageFormat = new ICUMessageFormat()
    const tokens = [
      {
        type: "text",
        value: "Hello World",
      },
    ]
    expect(messageFormat.fromTokens(tokens)).toEqual(
      expect.objectContaining({
        message: "Hello World",
        values: {},
      })
    )
  })

  it("should collect text message with arguments", function () {
    const messageFormat = new ICUMessageFormat()
    const tokens = [
      {
        type: "text",
        value: "Hello ",
      },
      {
        type: "arg",
        name: "name",
        value: "Joe",
      },
    ]
    expect(messageFormat.fromTokens(tokens)).toEqual(
      expect.objectContaining({
        message: "Hello {name}",
        values: {
          name: "Joe",
        },
      })
    )
  })
})

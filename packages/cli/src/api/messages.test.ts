import {
  createCompilationErrorMessage,
  createMissingErrorMessage,
} from "./messages.js"

describe("createMissingErrorMessage", () => {
  it("should print correct missing message", async () => {
    const message = createMissingErrorMessage(
      "en",
      [
        {
          id: "1",
          source: "Hello",
        },
        {
          id: "World",
          source: "World",
        },
      ],
      "bla bla"
    )

    expect(message).toMatchInlineSnapshot(`
      Failed to compile catalog for locale en!

      Missing 2 translation(s):

      1: Hello
      World: World

    `)
  })
})

describe("createCompilationErrorMessage", () => {
  const errors = [
    {
      error: new Error("Syntax error"),
      source: "Hello",
      id: "1",
    },
    {
      error: new Error("Syntax error"),
      source: "World",
      id: "World",
    },
  ]

  it("should print correct compile error message", () => {
    const message = createCompilationErrorMessage("en", errors)

    expect(message).toMatchInlineSnapshot(`
      Failed to compile catalog for locale en!

      Compilation error for 2 translation(s):

      1: Hello
      Reason: Syntax error

      World: World
      Reason: Syntax error


    `)
  })
})

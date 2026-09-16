import {
  createCompilationErrorMessage,
  createMissingErrorMessage,
} from "./messages.js"

describe("createMissingErrorMessage", () => {
  const missingMessages = [
    {
      id: "1",
      source: "Hello",
    },
    {
      id: "World",
      source: "World",
    },
  ]

  it("should print correct missing message for resolved behavior", () => {
    const message = createMissingErrorMessage("en", missingMessages, "resolved")

    expect(message).toMatchInlineSnapshot(`
      Failed to compile catalog for locale en!

      Missing 2 translation(s) after applying fallbackLocales:

      1: Hello
      World: World
    `)
  })

  it("should print correct missing message for catalog behavior", () => {
    const message = createMissingErrorMessage("en", missingMessages, "catalog")

    expect(message).toContain(
      "Missing 2 translation(s) before applying fallbackLocales:",
    )
  })

  it("should preserve the legacy message for arbitrary configuration strings", () => {
    const message = createMissingErrorMessage("en", missingMessages, "loader")

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

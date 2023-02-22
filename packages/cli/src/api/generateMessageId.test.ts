import { generateMessageId } from "./generateMessageId"

describe("generateMessageId", () => {
  it("Should generate an id for a message", () => {
    expect(generateMessageId("my message")).toMatchInlineSnapshot(`vQhkQx`)
  })

  it("Should generate different id when context is provided", () => {
    const withContext = generateMessageId("my message", "custom context")
    expect(withContext).toMatchInlineSnapshot(`gGUeZH`)

    expect(withContext != generateMessageId("my message")).toBeTruthy()
  })

  it("Message + context should not clash with message with suffix or prefix", () => {
    const context = "custom context"
    const withContext = generateMessageId("my message", context)
    const withSuffix = generateMessageId("my message" + context)
    const withPrefix = generateMessageId(context + "my message")

    expect(withContext != withSuffix).toBeTruthy()
    expect(withContext != withPrefix).toBeTruthy()
  })

  it("All kind of falsy context should give the same result", () => {
    const expected = `vQhkQx`
    expect(generateMessageId("my message")).toBe(expected)
    expect(generateMessageId("my message", "")).toBe(expected)
    expect(generateMessageId("my message", undefined)).toBe(expected)
    expect(generateMessageId("my message", null)).toBe(expected)
  })
})

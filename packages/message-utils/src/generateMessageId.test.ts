import { generateMessageId as generateMessageIdBrowser } from "./generateMessageId"
import { generateMessageId as generateMessageIdNode } from "./generateMessageId.node"

const implementations = [
  { name: "browser", fn: generateMessageIdBrowser },
  { name: "node", fn: generateMessageIdNode },
] as const

describe.each(implementations)("generateMessageId ($name)", ({ fn }) => {
  it("Should generate an id for a message", () => {
    expect(fn("my message")).toBe("vQhkQx")
  })

  it("Should generate different id when context is provided", () => {
    const withContext = fn("my message", "custom context")
    expect(withContext).toBe("gGUeZH")
    expect(withContext != fn("my message")).toBeTruthy()
  })

  it("Message + context should not clash with message with suffix or prefix", () => {
    const context = "custom context"
    const withContext = fn("my message", context)
    const withSuffix = fn("my message" + context)
    const withPrefix = fn(context + "my message")

    expect(withContext != withSuffix).toBeTruthy()
    expect(withContext != withPrefix).toBeTruthy()
  })

  it("All kind of falsy context should give the same result", () => {
    const expected = "vQhkQx"
    expect(fn("my message")).toBe(expected)
    expect(fn("my message", "")).toBe(expected)
    expect(fn("my message", undefined)).toBe(expected)
    // @ts-expect-error null is not valid type for context
    expect(fn("my message", null)).toBe(expected)
  })
})

describe("generateMessageId compatibility", () => {
  it("Node and browser versions should produce identical results", () => {
    const testCases = [
      ["Hello World", ""],
      ["my message", ""],
      ["my message", "custom context"],
      ["Test message with special chars: äöü", ""],
      ["Long message ".repeat(100), ""],
    ] as const

    testCases.forEach(([msg, ctx]) => {
      expect(generateMessageIdNode(msg, ctx)).toBe(
        generateMessageIdBrowser(msg, ctx)
      )
    })
  })
})

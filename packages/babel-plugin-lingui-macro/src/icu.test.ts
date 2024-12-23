import { describe, expect, it } from "vitest";
import { ICUMessageFormat, Token } from "./icu"
import { Identifier } from "@babel/types"

describe("ICU MessageFormat", function () {
  it("should collect text message", function () {
    const messageFormat = new ICUMessageFormat()
    const tokens: Token[] = [
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
    const tokens: Token[] = [
      {
        type: "text",
        value: "Hello ",
      },
      {
        type: "arg",
        name: "name",
        value: {
          type: "Identifier",
          name: "Joe",
        } as Identifier,
      },
    ]
    expect(messageFormat.fromTokens(tokens)).toEqual(
      expect.objectContaining({
        message: "Hello {name}",
        values: {
          name: {
            type: "Identifier",
            name: "Joe",
          },
        },
      })
    )
  })
})

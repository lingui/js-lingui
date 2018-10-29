import { parseExpression } from "@babel/parser"
import * as types from "@babel/types"
import Macro from "./newJs"

function createMacro() {
  return new Macro({ types })
}

describe("js macro", function() {
  describe("tokenizeTemplateLiteral", function() {
    it("simple message without arguments", function() {
      const macro = createMacro()
      const exp = parseExpression("`Message`")
      const tokens = macro.tokenizeTemplateLiteral(exp)
      expect(tokens).toEqual([
        {
          type: "text",
          value: "Message"
        }
      ])
    })

    it("message with named argument", function() {
      const macro = createMacro()
      const exp = parseExpression("`Message ${name}`")
      const tokens = macro.tokenizeTemplateLiteral(exp)
      expect(tokens).toEqual([
        {
          type: "text",
          value: "Message "
        },
        {
          type: "arg",
          name: "name",
          value: expect.anything()
        }
      ])
    })

    it("message with positional argument", function() {
      const macro = createMacro()
      const exp = parseExpression("`Message ${obj.name}`")
      const tokens = macro.tokenizeTemplateLiteral(exp)
      expect(tokens).toEqual([
        {
          type: "text",
          value: "Message "
        },
        {
          type: "arg",
          name: null,
          value: expect.anything()
        }
      ])
    })
  })
})

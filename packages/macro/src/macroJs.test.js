import { parseExpression } from "@babel/parser"
import * as types from "@babel/types"
import Macro from "./macroJs"

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
          value: expect.objectContaining({
            name: "name",
            type: "Identifier"
          })
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
          name: 0,
          value: expect.objectContaining({
            type: "MemberExpression"
          })
        }
      ])
    })

    it("message with plural", function() {
      const macro = createMacro()
      const exp = parseExpression("`Message ${t.plural({ value: count })}`")
      const tokens = macro.tokenizeTemplateLiteral(exp)
      expect(tokens).toEqual([
        {
          type: "text",
          value: "Message "
        },
        {
          type: "arg",
          name: "count",
          value: expect.objectContaining({
            type: "Identifier"
          }),
          format: "plural",
          options: {}
        }
      ])
    })
  })

  describe("tokenizeChoiceMethod", function() {
    it("plural", function() {
      const macro = createMacro()
      const exp = parseExpression(
        "t.plural({ value: count, one: '# book', other: '# books'})"
      )
      const tokens = macro.tokenizeChoiceMethod(exp)
      expect(tokens).toEqual({
        type: "arg",
        name: "count",
        value: expect.objectContaining({
          name: "count",
          type: "Identifier"
        }),
        format: "plural",
        options: {
          one: "# book",
          other: "# books"
        }
      })
    })

    it("plural with offset", function() {
      const macro = createMacro()
      const exp = parseExpression(
        `t.plural({
          value: count,
          offset: 1,
          0: 'No books',
          one: '# book',
          other: '# books'
         })`
      )
      const tokens = macro.tokenizeChoiceMethod(exp)
      expect(tokens).toEqual({
        type: "arg",
        name: "count",
        value: expect.objectContaining({
          name: "count",
          type: "Identifier"
        }),
        format: "plural",
        options: {
          offset: 1,
          "=0": "No books",
          one: "# book",
          other: "# books"
        }
      })
    })

    it("plural with template literal", function() {
      const macro = createMacro()
      const exp = parseExpression(
        "t.plural({ value: count, one: `# glass of ${drink}`, other: `# glasses of ${drink}`})"
      )
      const tokens = macro.tokenizeChoiceMethod(exp)
      expect(tokens).toEqual({
        type: "arg",
        name: "count",
        value: expect.objectContaining({
          name: "count",
          type: "Identifier"
        }),
        format: "plural",
        options: {
          one: [
            {
              type: "text",
              value: "# glass of "
            },
            {
              type: "arg",
              name: "drink",
              value: expect.objectContaining({
                name: "drink",
                type: "Identifier"
              })
            }
          ],
          other: [
            {
              type: "text",
              value: "# glasses of "
            },
            {
              type: "arg",
              name: "drink",
              value: expect.objectContaining({
                name: "drink",
                type: "Identifier"
              })
            }
          ]
        }
      })
    })

    it("plural with select", function() {
      const macro = createMacro()
      const exp = parseExpression(
        `t.plural({
          value: count, 
          one: t.select({
            value: gender,
            male: "he",
            female: "she",
            other: "they"
          })
        })`
      )
      const tokens = macro.tokenizeChoiceMethod(exp)
      expect(tokens).toEqual({
        type: "arg",
        name: "count",
        value: expect.objectContaining({
          name: "count",
          type: "Identifier"
        }),
        format: "plural",
        options: {
          one: [
            {
              type: "arg",
              name: "gender",
              value: expect.objectContaining({
                name: "gender",
                type: "Identifier"
              }),
              format: "select",
              options: {
                male: "he",
                female: "she",
                other: "they"
              }
            }
          ]
        }
      })
    })
  })
})

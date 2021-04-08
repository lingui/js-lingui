import { parseExpression } from "@babel/parser"
import * as types from "@babel/types"
import MacroJs from "./macroJs"

function createMacro() {
  return new MacroJs({ types }, { i18nImportName: "i18n" })
}

describe("js macro", () => {
  describe("tokenizeTemplateLiteral", () => {
    it("simple message without arguments", () => {
      const macro = createMacro()
      const exp = parseExpression("t`Message`")
      const tokens = macro.tokenizeTemplateLiteral(exp)
      expect(tokens).toEqual([
        {
          type: "text",
          value: "Message",
        },
      ])
    })

    it("message with named argument", () => {
      const macro = createMacro()
      const exp = parseExpression("t`Message ${name}`")
      const tokens = macro.tokenizeTemplateLiteral(exp)
      expect(tokens).toEqual([
        {
          type: "text",
          value: "Message ",
        },
        {
          type: "arg",
          name: "name",
          value: expect.objectContaining({
            name: "name",
            type: "Identifier",
          }),
        },
      ])
    })

    it("message with positional argument", () => {
      const macro = createMacro()
      const exp = parseExpression("t`Message ${obj.name}`")
      const tokens = macro.tokenizeTemplateLiteral(exp)
      expect(tokens).toEqual([
        {
          type: "text",
          value: "Message ",
        },
        {
          type: "arg",
          name: 0,
          value: expect.objectContaining({
            type: "MemberExpression",
          }),
        },
      ])
    })

    it("message with plural", () => {
      const macro = createMacro()
      const exp = parseExpression("t`Message ${plural(count, {})}`")
      const tokens = macro.tokenizeTemplateLiteral(exp)
      expect(tokens).toEqual([
        {
          type: "text",
          value: "Message ",
        },
        {
          type: "arg",
          name: "count",
          value: expect.objectContaining({
            type: "Identifier",
          }),
          format: "plural",
          options: {},
        },
      ])
    })

    it("message with unicode chars is respected", () => {
      const macro = createMacro()
      const exp = parseExpression('t`Message \\u0020`')
      const tokens = macro.tokenizeTemplateLiteral(exp)
      expect(tokens).toEqual([
        {
          type: "text",
          value: 'Message \/u0020',
        },
      ])
    })

    it("message with double scaped literals it's stripped", () => {
      const macro = createMacro()
      const exp = parseExpression('t\`Passing \\`${argSet}\\` is not supported.\`')
      const tokens = macro.tokenizeTemplateLiteral(exp)
      expect(tokens).toEqual([
        {
          type: "text",
          value: 'Passing `',
        },
        {
          name: "argSet",
          type: "arg",
          value: {
            end: 20,
            loc:  {
              end:  {
                column: 20,
                line: 1,
              },
              identifierName: "argSet",
              start:  {
                column: 14,
                line: 1,
              },
            },
            name: "argSet",
            start: 14,
            type: "Identifier",
          },
        },
        {
          type: "text",
          value: "` is not supported.",
        },
      ])
    })
  })

  describe("tokenizeChoiceMethod", () => {
    it("plural", () => {
      const macro = createMacro()
      const exp = parseExpression(
        "plural(count, { one: '# book', other: '# books'})"
      )
      const tokens = macro.tokenizeChoiceComponent(exp)
      expect(tokens).toEqual({
        type: "arg",
        name: "count",
        value: expect.objectContaining({
          name: "count",
          type: "Identifier",
        }),
        format: "plural",
        options: {
          one: "# book",
          other: "# books",
        },
      })
    })

    it("plural with offset", () => {
      const macro = createMacro()
      const exp = parseExpression(
        `plural(count, {
          offset: 1,
          0: 'No books',
          one: '# book',
          other: '# books'
         })`
      )
      const tokens = macro.tokenizeChoiceComponent(exp)
      expect(tokens).toEqual({
        type: "arg",
        name: "count",
        value: expect.objectContaining({
          name: "count",
          type: "Identifier",
        }),
        format: "plural",
        options: {
          offset: 1,
          "=0": "No books",
          one: "# book",
          other: "# books",
        },
      })
    })

    it("plural with template literal", () => {
      const macro = createMacro()
      const exp = parseExpression(
        "plural(count, { one: `# glass of ${drink}`, other: `# glasses of ${drink}`})"
      )
      const tokens = macro.tokenizeChoiceComponent(exp)
      expect(tokens).toEqual({
        type: "arg",
        name: "count",
        value: expect.objectContaining({
          name: "count",
          type: "Identifier",
        }),
        format: "plural",
        options: {
          one: [
            {
              type: "text",
              value: "# glass of ",
            },
            {
              type: "arg",
              name: "drink",
              value: expect.objectContaining({
                name: "drink",
                type: "Identifier",
              }),
            },
          ],
          other: [
            {
              type: "text",
              value: "# glasses of ",
            },
            {
              type: "arg",
              name: "drink",
              value: expect.objectContaining({
                name: "drink",
                type: "Identifier",
              }),
            },
          ],
        },
      })
    })

    it("plural with select", () => {
      const macro = createMacro()
      const exp = parseExpression(
        `plural(count, {
          one: select(gender, {
            male: "he",
            female: "she",
            other: "they"
          })
        })`
      )
      const tokens = macro.tokenizeChoiceComponent(exp)
      expect(tokens).toEqual({
        type: "arg",
        name: "count",
        value: expect.objectContaining({
          name: "count",
          type: "Identifier",
        }),
        format: "plural",
        options: {
          one: [
            {
              type: "arg",
              name: "gender",
              value: expect.objectContaining({
                name: "gender",
                type: "Identifier",
              }),
              format: "select",
              options: {
                male: "he",
                female: "she",
                other: "they",
              },
            },
          ],
        },
      })
    })

    it("select", () => {
      const macro = createMacro()
      const exp = parseExpression(
        `select(gender, {
          male: "he",
          female: "she",
          other: "they"
        })`
      )
      const tokens = macro.tokenizeChoiceComponent(exp)
      expect(tokens).toEqual({
        format: "select",
        name: "gender",
        options: expect.objectContaining({
          female: "she",
          male: "he",
          offset: undefined,
          other: "they"
        }),
        type: "arg",
        value: {
          end: 13,
          loc: {
            end: expect.objectContaining({
              column: 13,
              line: 1,
            }),
            identifierName: "gender",
            start: expect.objectContaining({
              column: 7,
              line: 1,
            }),
          },
          name: "gender",
          start: 7,
          type: "Identifier",
        }
      })
    })
  })
})

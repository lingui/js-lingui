import * as types from "@babel/types"
import { type CallExpression, type Expression } from "@babel/types"
import MacroJs from "./macroJs"
import type { NodePath } from "@babel/traverse"
import { transformSync } from "@babel/core"
import { JsMacroName } from "./constants"

const parseExpression = (expression: string) => {
  let path: NodePath<Expression>

  const importExp = `import {t, plural, select, selectOrdinal} from "@lingui/core/macro"; \n`
  transformSync(importExp + expression, {
    filename: "unit-test.js",
    configFile: false,
    presets: [],
    plugins: [
      "@babel/plugin-syntax-jsx",
      {
        visitor: {
          "CallExpression|TaggedTemplateExpression": (
            d: NodePath<Expression>
          ) => {
            path = d
            d.stop()
          },
        },
      },
    ],
  })

  return path
}

function createMacro() {
  return new MacroJs(
    { types },
    {
      i18nImportName: "i18n",
      stripNonEssentialProps: false,
      useLinguiImportName: "useLingui",
    }
  )
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

    it("with custom lingui instance", () => {
      const macro = createMacro()
      const exp = parseExpression("t(i18n)`Message`")
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
          name: "0",
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

    it("message with unicode \\u chars is interpreted by babel", () => {
      const macro = createMacro()
      const exp = parseExpression("t`Message \\u0020`")
      const tokens = macro.tokenizeTemplateLiteral(exp)
      expect(tokens).toEqual([
        {
          type: "text",
          value: "Message  ",
        },
      ])
    })

    it("message with unicode \\x chars is interpreted by babel", () => {
      const macro = createMacro()
      const exp = parseExpression("t`Bienvenue\\xA0!`")
      const tokens = macro.tokenizeTemplateLiteral(exp)
      expect(tokens).toEqual([
        {
          type: "text",
          // Looks like an empty space, but it isn't
          value: "Bienvenue !",
        },
      ])
    })

    it("message with double escaped literals it's stripped", () => {
      const macro = createMacro()
      const exp = parseExpression(
        "t`Passing \\`${argSet}\\` is not supported.`"
      )
      const tokens = macro.tokenizeTemplateLiteral(exp)
      expect(tokens).toMatchObject([
        {
          type: "text",
          value: "Passing `",
        },
        {
          name: "argSet",
          type: "arg",
          value: {
            loc: {
              identifierName: "argSet",
            },
            name: "argSet",
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
      const tokens = macro.tokenizeChoiceComponent(
        exp as NodePath<CallExpression>,
        JsMacroName.plural
      )
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
      const tokens = macro.tokenizeChoiceComponent(
        exp as NodePath<CallExpression>,
        JsMacroName.plural
      )
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
      const tokens = macro.tokenizeChoiceComponent(
        exp as NodePath<CallExpression>,
        JsMacroName.plural
      )
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
            male: hePronoun,
            female: "she",
            other: "they"
          }),
          other: otherText
        })`
      )
      const tokens = macro.tokenizeChoiceComponent(
        exp as NodePath<CallExpression>,
        JsMacroName.plural
      )
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
                male: expect.objectContaining({
                  type: "arg",
                  name: "hePronoun",
                  value: expect.objectContaining({
                    name: "hePronoun",
                    type: "Identifier",
                  }),
                }),
                female: "she",
                other: "they",
              },
            },
          ],
          other: expect.objectContaining({
            type: "arg",
            name: "otherText",
            value: expect.objectContaining({
              name: "otherText",
              type: "Identifier",
            }),
          }),
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
      const tokens = macro.tokenizeChoiceComponent(
        exp as NodePath<CallExpression>,
        JsMacroName.select
      )
      expect(tokens).toMatchObject({
        format: "select",
        name: "gender",
        options: expect.objectContaining({
          female: "she",
          male: "he",
          offset: undefined,
          other: "they",
        }),
        type: "arg",
        value: {
          name: "gender",
          type: "Identifier",
        },
      })
    })
  })
})

import * as types from "@babel/types"
import { normalizeWhitespace, MacroJSX } from "./macroJsx"
import { transformSync } from "@babel/core"
import type { NodePath } from "@babel/traverse"
import type { JSXElement } from "@babel/types"

const parseExpression = (expression: string) => {
  let path: NodePath<JSXElement>

  transformSync(expression, {
    filename: "unit-test.js",
    plugins: [
      {
        visitor: {
          JSXElement: (d) => {
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
  return new MacroJSX(
    { types },
    { stripNonEssentialProps: false, nameMap: new Map() }
  )
}

describe("jsx macro", () => {
  describe("normalizeWhitespace", () => {
    it("should remove whitespace before/after expression", () => {
      const actual = normalizeWhitespace(
        `You have

          {count, plural, one {Message} other {Messages}}`
      )

      expect(actual).toBe(
        `You have{count, plural, one {Message} other {Messages}}`
      )
    })

    it("should remove whitespace before/after tag", () => {
      const actual = normalizeWhitespace(
        `    Hello <strong>World!</strong><br />
    <p>
     My name is <a href="/about">{{" "}}
      <em>{{name}}</em></a>
    </p>`
      )

      expect(actual).toBe(
        `Hello <strong>World!</strong><br /><p>My name is <a href="/about">{{" "}}<em>{{name}}</em></a></p>`
      )
    })

    it("should remove whitespace before/after tag", () => {
      const actual = normalizeWhitespace(
        `Property {0},
          function {1},
          array {2},
          constant {3},
          object {4},
          everything {5}`
      )

      expect(actual).toBe(
        `Property {0}, function {1}, array {2}, constant {3}, object {4}, everything {5}`
      )
    })

    it("should remove trailing whitespaces in icu expressions", () => {
      const actual = normalizeWhitespace(
        `{count, plural, one {

              <0>#</0> slot added

            } other {

              <1>#</1> slots added

            }}
`
      )

      expect(actual).toBe(
        `{count, plural, one {<0>#</0> slot added} other {<1>#</1> slots added}}`
      )
    })

    it("should remove leading whitespaces in icu expressions", () => {
      const actual = normalizeWhitespace(
        `{count, plural, one {

              One hello

            } other {

              Other hello

            }}
`
      )

      expect(actual).toBe(
        `{count, plural, one {One hello} other {Other hello}}`
      )
    })
  })

  describe("tokenizeTrans", () => {
    it("simple message without arguments", () => {
      const macro = createMacro()
      const exp = parseExpression("<Trans>Message</Trans>")
      const tokens = macro.tokenizeTrans(exp)
      expect(tokens).toEqual([
        {
          type: "text",
          value: "Message",
        },
      ])
    })

    it("message with named argument", () => {
      const macro = createMacro()
      const exp = parseExpression("<Trans>Message {name}</Trans>")
      const tokens = macro.tokenizeTrans(exp)
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
      const exp = parseExpression("<Trans>Message {obj.name}</Trans>")
      const tokens = macro.tokenizeTrans(exp)
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
      const exp = parseExpression(
        "<Trans>Message <Plural value={count} /></Trans>"
      )
      const tokens = macro.tokenizeTrans(exp)
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
  })

  describe("tokenizeChoiceComponent", () => {
    it("plural", () => {
      const macro = createMacro()
      const exp = parseExpression(
        "<Plural value={count} one='# book' other='# books' />"
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
        `<Plural
          value={count}
          offset={1}
          _0='No books'
          one='# book'
          other='# books'
         />`
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

    it("plural with key should be omitted", () => {
      const macro = createMacro()
      const exp = parseExpression(
        `<Plural
          key='somePLural'
          value={count}
          _0='No books'
          one='# book'
          other='# books'
         />`
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
          "=0": "No books",
          one: "# book",
          other: "# books",
        },
      })
    })

    it("plural with template literal", () => {
      const macro = createMacro()
      const exp = parseExpression(
        "<Plural value={count} one={`# glass of ${drink}`} other={`# glasses of ${drink}`} />"
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
        `<Plural
          value={count}
          one={
            <Select
              value={gender}
              _male="he"
              _female="she"
              other="they"
            />
          }
        />`
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

    it("Select", () => {
      const macro = createMacro()
      const exp = parseExpression(
        `<Select
          value={gender}
          male="he"
          one="heone"
          female="she"
          other="they"
        />`
      )
      const tokens = macro.tokenizeNode(exp)
      expect(tokens[0]).toMatchObject({
        format: "select",
        name: "gender",
        options: {
          female: "she",
          male: "he",
          offset: undefined,
          other: "they",
        },
        type: "arg",
        value: {
          end: 31,
          loc: {
            end: {
              column: 23,
              line: 2,
            },
            identifierName: "gender",
            start: {
              column: 17,
              line: 2,
            },
          },
          name: "gender",
          type: "Identifier",
        },
      })
    })
  })
})

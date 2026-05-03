import { describe, it, expect } from "vitest"
import { makeConfig } from "@lingui/conf"
import {
  parseLinguiDirective,
  collectLinguiDirectives,
  findDirectiveForLine,
} from "../src/linguiDirective"
import type { Comment } from "@babel/types"
import { macroTester } from "./macroTester"

describe("parseLinguiDirective", () => {
  it("should parse context", () => {
    expect(parseLinguiDirective(' lingui-set context="my context" ')).toEqual({
      reset: false,
      values: { context: { text: "my context" } },
    })
  })

  it("should parse comment", () => {
    expect(parseLinguiDirective(' lingui-set comment="my comment" ')).toEqual({
      reset: false,
      values: { comment: { text: "my comment" } },
    })
  })

  it("should parse idPrefix", () => {
    expect(parseLinguiDirective(' lingui-set idPrefix="prefix." ')).toEqual({
      reset: false,
      values: { idPrefix: "prefix." },
    })
  })

  it("should parse multiple keys", () => {
    expect(
      parseLinguiDirective(
        ' lingui-set context="ctx" comment="cmt" idPrefix="p." ',
      ),
    ).toEqual({
      reset: false,
      values: {
        context: { text: "ctx" },
        comment: { text: "cmt" },
        idPrefix: "p.",
      },
    })
  })

  it("should return null for non-directive comments", () => {
    expect(parseLinguiDirective(" some comment ")).toBeNull()
    expect(parseLinguiDirective(" i18n ")).toBeNull()
  })

  it("should throw for lingui-set with no params", () => {
    expect(() => parseLinguiDirective(" lingui-set ")).toThrow(
      "requires at least one param",
    )
  })

  it("should throw for unknown params", () => {
    expect(() => parseLinguiDirective(' lingui-set unknown="value" ')).toThrow(
      'unknown param "unknown"',
    )

    expect(() =>
      parseLinguiDirective(' lingui-set context="ctx" foo="bar" '),
    ).toThrow('unknown param "foo"')
  })

  it("should throw for valid key without a value", () => {
    expect(() => parseLinguiDirective(" lingui-set context ")).toThrow(
      '"context" requires a value',
    )
    expect(() => parseLinguiDirective(" lingui-set comment ")).toThrow(
      '"comment" requires a value',
    )
    expect(() => parseLinguiDirective(" lingui-reset comment ")).toThrow(
      '"comment" requires a value',
    )
  })

  it("should throw for invalid syntax", () => {
    expect(() => parseLinguiDirective(" lingui-set context='single' ")).toThrow(
      "requires a value",
    )
    expect(() => parseLinguiDirective(" lingui-set context=single ")).toThrow(
      "requires a value",
    )
    expect(() => parseLinguiDirective(" lingui-reset context=single ")).toThrow(
      "requires a value",
    )
  })

  it("should handle values with spaces", () => {
    expect(
      parseLinguiDirective(
        ' lingui-set context="my custom context with spaces" ',
      ),
    ).toEqual({
      reset: false,
      values: { context: { text: "my custom context with spaces" } },
    })
  })

  it("should set empty string values to null (unset sentinel)", () => {
    expect(parseLinguiDirective(' lingui-set context="" ')).toEqual({
      reset: false,
      values: { context: null },
    })
    expect(
      parseLinguiDirective(' lingui-set context="" comment="note" '),
    ).toEqual({
      reset: false,
      values: { context: null, comment: { text: "note" } },
    })
  })

  it("should parse reset keyword", () => {
    expect(parseLinguiDirective(" lingui-reset")).toEqual({
      reset: true,
      values: {},
    })
  })

  it("should not treat reset as keyword when used in a value", () => {
    expect(parseLinguiDirective(' lingui-set context="reset" ')).toEqual({
      reset: false,
      values: { context: { text: "reset" } },
    })
  })

  it("should parse reset combined with values", () => {
    expect(parseLinguiDirective(' lingui-reset context="new ctx" ')).toEqual({
      reset: true,
      values: { context: { text: "new ctx" } },
    })
  })

  it("should parse without leading or trailing spaces", () => {
    expect(
      parseLinguiDirective('lingui-set context="ctx" comment="cmt"'),
    ).toEqual({
      reset: false,
      values: { context: { text: "ctx" }, comment: { text: "cmt" } },
    })
  })
})

describe("collectLinguiDirectives", () => {
  it("should collect and sort directives from comments", () => {
    const comments: Comment[] = [
      {
        type: "CommentBlock",
        value: ' lingui-set context="ctx1" ',
        start: 0,
        end: 30,
        loc: {
          start: { line: 1, column: 0, index: 0 },
          end: { line: 1, column: 30, index: 30 },
          filename: "",
          identifierName: undefined,
        },
      },
      {
        type: "CommentLine",
        value: " not a directive",
        start: 31,
        end: 50,
        loc: {
          start: { line: 2, column: 0, index: 31 },
          end: { line: 2, column: 20, index: 50 },
          filename: "",
          identifierName: undefined,
        },
      },
      {
        type: "CommentLine",
        value: ' lingui-set comment="cmt" ',
        start: 51,
        end: 80,
        loc: {
          start: { line: 5, column: 0, index: 51 },
          end: { line: 5, column: 30, index: 80 },
          filename: "",
          identifierName: undefined,
        },
      },
      {
        type: "CommentLine",
        value: ' lingui-reset context="ctx2" ',
        start: 81,
        end: 115,
        loc: {
          start: { line: 8, column: 0, index: 81 },
          end: { line: 8, column: 34, index: 115 },
          filename: "",
          identifierName: undefined,
        },
      },
    ]

    const result = collectLinguiDirectives(comments)
    expect(result).toEqual([
      {
        line: 1,
        reset: false,
        values: { context: { text: "ctx1" } },
      },
      {
        line: 5,
        reset: false,
        values: { context: { text: "ctx1" }, comment: { text: "cmt" } },
      },
      {
        line: 8,
        reset: true,
        values: { context: { text: "ctx2" } },
      },
    ])
  })

  it("should return empty array for no comments", () => {
    expect(collectLinguiDirectives([])).toEqual([])
    expect(collectLinguiDirectives(null as any)).toEqual([])
  })
})

describe("findDirectiveForLine", () => {
  // These represent pre-merged directives (as produced by collectLinguiDirectives)
  const directives = [
    { line: 3, values: { context: { text: "first" } } },
    { line: 10, values: { context: { text: "second" } } },
    { line: 20, values: { comment: { text: "third" } } },
  ]

  it("should return undefined for line before any directive", () => {
    expect(findDirectiveForLine(directives, 1)).toBeUndefined()
  })

  it("should return the directive on its own line", () => {
    expect(findDirectiveForLine(directives, 3)).toEqual({
      context: { text: "first" },
    })
  })

  it("should return closest preceding directive", () => {
    expect(findDirectiveForLine(directives, 7)).toEqual({
      context: { text: "first" },
    })
    expect(findDirectiveForLine(directives, 15)).toEqual({
      context: { text: "second" },
    })
    expect(findDirectiveForLine(directives, 100)).toEqual({
      comment: { text: "third" },
    })
  })

  it("should return undefined for empty directives", () => {
    expect(findDirectiveForLine([], 5)).toBeUndefined()
  })
})

// Integration tests with babel transform
describe("lingui-set directive: JS macros", () => {
  macroTester({
    cases: [
      {
        name: "t with directive context (block comment)",
        code: `
          import { t } from '@lingui/core/macro';
          /* lingui-set context="my context" */
          const msg = t\`Hello\`
        `,
      },
      {
        name: "t with directive comment (line comment)",
        code: `
          import { t } from '@lingui/core/macro';
          // lingui-set comment="translator note"
          const msg = t\`Hello\`
        `,
      },
      {
        name: "t with directive context and comment",
        code: `
          import { t } from '@lingui/core/macro';
          /* lingui-set context="ctx" comment="cmt" */
          const msg = t\`Hello\`
        `,
      },
      {
        name: "defineMessage with directive context",
        code: `
          import { defineMessage } from '@lingui/core/macro';
          /* lingui-set context="my context" */
          const msg = defineMessage({ message: "Hello" })
        `,
      },
      {
        name: "defineMessage tagged template with directive",
        code: `
          import { defineMessage } from '@lingui/core/macro';
          /* lingui-set context="my context" comment="note" */
          const msg = defineMessage\`Hello\`
        `,
      },
      {
        name: "explicit context overrides directive",
        code: `
          import { defineMessage } from '@lingui/core/macro';
          /* lingui-set context="directive ctx" comment="directive cmt" */
          const msg = defineMessage({ message: "Hello", context: "explicit ctx" })
        `,
      },
      {
        name: "explicit comment overrides directive",
        code: `
          import { t } from '@lingui/core/macro';
          /* lingui-set comment="directive cmt" */
          const msg = t({ message: "Hello", comment: "explicit cmt" })
        `,
      },
      {
        name: "directive applies to multiple subsequent macros",
        code: `
          import { t } from '@lingui/core/macro';
          /* lingui-set context="shared" */
          const msg1 = t\`Hello\`
          const msg2 = t\`World\`
        `,
      },
      {
        name: "closest directive takes precedence",
        code: `
          import { t } from '@lingui/core/macro';
          /* lingui-set context="first" */
          const msg1 = t\`Hello\`
          /* lingui-set context="second" */
          const msg2 = t\`World\`
        `,
      },
      {
        name: "directives merge with preceding ones",
        code: `
          import { t } from '@lingui/core/macro';
          /* lingui-set context="ctx" comment="cmt" */
          const msg1 = t\`Hello\`
          /* lingui-set context="new ctx" */
          const msg2 = t\`World\`
        `,
      },
      {
        name: "reset clears all inherited values",
        code: `
          import { t } from '@lingui/core/macro';
          /* lingui-set context="first" comment="second" idPrefix="prefix." */
          const msg1 = t\`Hello\`
          /* lingui-reset */
          const msg2 = t\`World\`
        `,
      },
      {
        name: "reset combined with new values",
        code: `
          import { t } from '@lingui/core/macro';
          /* lingui-set context="first" comment="second" */
          const msg1 = t\`Hello\`
          /* lingui-reset context="fresh" */
          const msg2 = t\`World\`
        `,
      },
      {
        name: "empty param value clears single param while leaving others intact",
        code: `
          import { t } from '@lingui/core/macro';
          /* lingui-set context="first" comment="second" */
          const msg1 = t\`Hello\`
          /* lingui-set context="" */
          const msg2 = t\`World\`
        `,
      },
      {
        name: "plural with directive context",
        code: `
          import { plural } from '@lingui/core/macro';
          /* lingui-set context="my context" */
          const msg = plural(count, { one: "# book", other: "# books" })
        `,
      },
      {
        name: "select with directive context",
        code: `
          import { select } from '@lingui/core/macro';
          /* lingui-set context="my context" */
          const msg = select(gender, { male: "he", female: "she", other: "they" })
        `,
      },
      {
        name: "idPrefix and implicit ID",
        code: `
          import { t } from '@lingui/core/macro';
          /* lingui-set idPrefix="module." */
          const msg = t\`Hello\`
        `,
      },
      {
        name: "idPrefix with explicit id",
        code: `
          import { defineMessage } from '@lingui/core/macro';
          /* lingui-set idPrefix="module." */
          const msg = defineMessage({ id: "greeting", message: "Hello" })
        `,
      },
      {
        name: "With idPrefixLeader",
        macroOpts: {
          linguiConfig: makeConfig(
            {
              macro: {
                idPrefixLeader: ".",
              },
            },
            { skipValidation: true },
          ),
        },
        code: `
          import { i18n } from '@lingui/core/macro';
          import { t } from '@lingui/core/macro';
          /* lingui-set idPrefix="module" comment="cmt" */
          const msg = i18n.t({ id: "unprefixed", message: "Welcome" })
          const msg2 = t({ id: ".my.id", message: "Welcome" })
        `,
      },
      {
        name: "idPrefix + idPrefixLeader with dynamic id",
        shouldThrow: false,
        macroOpts: {
          linguiConfig: makeConfig(
            {
              macro: {
                idPrefixLeader: ".",
              },
            },
            { skipValidation: true },
          ),
        },
        code: `
          import { t } from '@lingui/core/macro';
          /* lingui-set idPrefix="module" */
          const dynId = "dynamic";
          const msg = t({ id: dynId, message: "Welcome" })
        `,
      },
      {
        name: "no directive - normal behavior",
        code: `
          import { t } from '@lingui/core/macro';
          const msg = t\`Hello\`
        `,
      },
      {
        name: "production: directive context affects id hash",
        production: true,
        code: `
          import { t } from '@lingui/core/macro';
          /* lingui-set context="my context" */
          const msg = t\`Hello\`
        `,
      },
    ],
  })
})

describe("lingui-set directive: useLingui", () => {
  macroTester({
    cases: [
      {
        name: "useLingui t with directive context",
        code: `
          import { useLingui } from '@lingui/react/macro';
          function App() {
            const { t } = useLingui()
            /* lingui-set context="my context" */
            return t\`Hello\`
          }
        `,
      },
      {
        name: "useLingui t with directive applied per-reference",
        code: `
          import { useLingui } from '@lingui/react/macro';
          function App() {
            const { t } = useLingui()
            /* lingui-set context="first" */
            const msg1 = t\`Hello\`
            /* lingui-set context="second" */
            const msg2 = t\`World\`
            return msg1 + msg2
          }
        `,
      },
    ],
  })
})

describe("lingui-set directive: JSX macros", () => {
  macroTester({
    cases: [
      {
        name: "Trans with directive context",
        code: `
          import { Trans } from '@lingui/react/macro';
          /* lingui-set context="my context" */
          const el = <Trans>Hello</Trans>
        `,
      },
      {
        name: "Trans with directive comment",
        code: `
          import { Trans } from '@lingui/react/macro';
          // lingui-set comment="translator note"
          const el = <Trans>Hello</Trans>
        `,
      },
      {
        name: "Trans with explicit context overrides directive",
        code: `
          import { Trans } from '@lingui/react/macro';
          /* lingui-set context="directive ctx" */
          const el = <Trans context="explicit ctx">Hello</Trans>
        `,
      },
      {
        name: "Plural with directive context",
        code: `
          import { Plural } from '@lingui/react/macro';
          /* lingui-set context="my context" */
          const el = <Plural value={count} one="# book" other="# books" />
        `,
      },
      {
        name: "Select with directive context",
        code: `
          import { Select } from '@lingui/react/macro';
          /* lingui-set context="my context" */
          const el = <Select value={gender} male="he" female="she" other="they" />
        `,
      },
      {
        name: "Trans with dynamic id and no idPrefix",
        code: `
          import { Trans } from '@lingui/react/macro';
          const dynId = "dynamic";
          const el = <Trans id={dynId}>Hello</Trans>
        `,
      },
      {
        name: "Trans with dynamic ID and idPrefix",
        shouldThrow: false,
        code: `
          import { Trans } from '@lingui/react/macro';
          /* lingui-set idPrefix="module." */
          const el = <Trans id={dynId}>Hello</Trans>
        `,
      },
      {
        name: "Trans with directive idPrefix and explicit id",
        code: `
          import { Trans } from '@lingui/react/macro';
          /* lingui-set idPrefix="module." */
          const el = <Trans id="greeting">Hello</Trans>
        `,
      },
      {
        name: "Trans with directive idPrefix without explicit id",
        code: `
          import { Trans } from '@lingui/react/macro';
          /* lingui-set idPrefix="module." */
          const el = <Trans>Hello</Trans>
        `,
      },
      {
        name: "Trans with idPrefixLeader",
        macroOpts: {
          linguiConfig: makeConfig(
            {
              macro: {
                idPrefixLeader: ".",
              },
            },
            { skipValidation: true },
          ),
        },
        code: `
          import { Trans } from '@lingui/react/macro';
          /* lingui-set idPrefix="checkout" */
          const el1 = <Trans id=".usesPrefix">Hello</Trans>
          const el2 = <Trans id=".usesPrefix.with.subpath">Hello</Trans>
          const el3 = <Trans id="unprefixed.key">Hello</Trans>
          const el4 = <Trans id="unprefixed">Hello</Trans>
          const el5 = <Trans id="test">Hello</Trans>
        `,
      },
      {
        name: "multiple directives switching context mid-file",
        code: `
          import { Trans } from '@lingui/react/macro';
          /* lingui-set context="header" */
          const h = <Trans>Title</Trans>
          /* lingui-set context="footer" */
          const f = <Trans>Copyright</Trans>
        `,
      },
    ],
  })
})

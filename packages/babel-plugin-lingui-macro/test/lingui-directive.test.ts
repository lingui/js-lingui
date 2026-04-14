import { describe, it, expect } from "vitest"
import {
  parseLinguiDirective,
  collectLinguiDirectives,
  findDirectiveForLine,
} from "../src/linguiDirective"
import type { Comment } from "@babel/types"
import { macroTester } from "./macroTester"

describe("parseLinguiDirective", () => {
  it("should parse context", () => {
    expect(parseLinguiDirective(' @lingui context="my context" ')).toEqual({
      context: { text: "my context" },
    })
  })

  it("should parse comment", () => {
    expect(parseLinguiDirective(' @lingui comment="my comment" ')).toEqual({
      comment: { text: "my comment" },
    })
  })

  it("should parse idPrefix", () => {
    expect(parseLinguiDirective(' @lingui idPrefix="prefix." ')).toEqual({
      idPrefix: "prefix.",
    })
  })

  it("should parse multiple keys", () => {
    expect(
      parseLinguiDirective(
        ' @lingui context="ctx" comment="cmt" idPrefix="p." ',
      ),
    ).toEqual({
      context: { text: "ctx" },
      comment: { text: "cmt" },
      idPrefix: "p.",
    })
  })

  it("should return null for non-directive comments", () => {
    expect(parseLinguiDirective(" some comment ")).toBeNull()
    expect(parseLinguiDirective(" i18n ")).toBeNull()
  })

  it("should return null for @lingui with no valid params", () => {
    expect(parseLinguiDirective(" @lingui ")).toBeNull()
    expect(parseLinguiDirective(' @lingui unknown="value" ')).toBeNull()
  })

  it("should handle values with spaces", () => {
    expect(
      parseLinguiDirective(
        ' @lingui context="my custom context with spaces" ',
      ),
    ).toEqual({ context: { text: "my custom context with spaces" } })
  })

  it("should handle empty string values", () => {
    expect(parseLinguiDirective(' @lingui context="" ')).toEqual({
      context: { text: "" },
    })
  })
})

describe("collectLinguiDirectives", () => {
  it("should collect and sort directives from comments", () => {
    const comments: Comment[] = [
      {
        type: "CommentBlock",
        value: ' @lingui context="ctx1" ',
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
        value: ' @lingui comment="cmt" ',
        start: 51,
        end: 80,
        loc: {
          start: { line: 5, column: 0, index: 51 },
          end: { line: 5, column: 30, index: 80 },
          filename: "",
          identifierName: undefined,
        },
      },
    ]

    const result = collectLinguiDirectives(comments)
    expect(result).toEqual([
      { line: 1, values: { context: { text: "ctx1" } } },
      { line: 5, values: { comment: { text: "cmt" } } },
    ])
  })

  it("should return empty array for no comments", () => {
    expect(collectLinguiDirectives([])).toEqual([])
    expect(collectLinguiDirectives(null as any)).toEqual([])
  })
})

describe("findDirectiveForLine", () => {
  const directives = [
    { line: 3, values: { context: { text: "first" } } },
    { line: 10, values: { context: { text: "second" } } },
    { line: 20, values: { comment: { text: "third" } } },
  ]

  it("should return undefined for line before any directive", () => {
    expect(findDirectiveForLine(directives, 1)).toBeUndefined()
  })

  it("should return the directive on its own line", () => {
    expect(findDirectiveForLine(directives, 3)).toEqual({ context: { text: "first" } })
  })

  it("should return closest preceding directive", () => {
    expect(findDirectiveForLine(directives, 7)).toEqual({ context: { text: "first" } })
    expect(findDirectiveForLine(directives, 15)).toEqual({ context: { text: "second" } })
    expect(findDirectiveForLine(directives, 100)).toEqual({ comment: { text: "third" } })
  })

  it("should return undefined for empty directives", () => {
    expect(findDirectiveForLine([], 5)).toBeUndefined()
  })
})

// Integration tests with babel transform
describe("@lingui directive: JS macros", () => {
  macroTester({
    cases: [
      {
        name: "t with directive context (block comment)",
        code: `
          import { t } from '@lingui/core/macro';
          /* @lingui context="my context" */
          const msg = t\`Hello\`
        `,
      },
      {
        name: "t with directive comment (line comment)",
        code: `
          import { t } from '@lingui/core/macro';
          // @lingui comment="translator note"
          const msg = t\`Hello\`
        `,
      },
      {
        name: "t with directive context and comment",
        code: `
          import { t } from '@lingui/core/macro';
          /* @lingui context="ctx" comment="cmt" */
          const msg = t\`Hello\`
        `,
      },
      {
        name: "defineMessage with directive context",
        code: `
          import { defineMessage } from '@lingui/core/macro';
          /* @lingui context="my context" */
          const msg = defineMessage({ message: "Hello" })
        `,
      },
      {
        name: "defineMessage tagged template with directive",
        code: `
          import { defineMessage } from '@lingui/core/macro';
          /* @lingui context="my context" comment="note" */
          const msg = defineMessage\`Hello\`
        `,
      },
      {
        name: "explicit context overrides directive",
        code: `
          import { defineMessage } from '@lingui/core/macro';
          /* @lingui context="directive ctx" comment="directive cmt" */
          const msg = defineMessage({ message: "Hello", context: "explicit ctx" })
        `,
      },
      {
        name: "explicit comment overrides directive",
        code: `
          import { t } from '@lingui/core/macro';
          /* @lingui comment="directive cmt" */
          const msg = t({ message: "Hello", comment: "explicit cmt" })
        `,
      },
      {
        name: "directive applies to multiple subsequent macros",
        code: `
          import { t } from '@lingui/core/macro';
          /* @lingui context="shared" */
          const msg1 = t\`Hello\`
          const msg2 = t\`World\`
        `,
      },
      {
        name: "closest directive takes precedence",
        code: `
          import { t } from '@lingui/core/macro';
          /* @lingui context="first" */
          const msg1 = t\`Hello\`
          /* @lingui context="second" */
          const msg2 = t\`World\`
        `,
      },
      {
        name: "plural with directive context",
        code: `
          import { plural } from '@lingui/core/macro';
          /* @lingui context="my context" */
          const msg = plural(count, { one: "# book", other: "# books" })
        `,
      },
      {
        name: "select with directive context",
        code: `
          import { select } from '@lingui/core/macro';
          /* @lingui context="my context" */
          const msg = select(gender, { male: "he", female: "she", other: "they" })
        `,
      },
      {
        name: "idPrefix with explicit id",
        code: `
          import { defineMessage } from '@lingui/core/macro';
          /* @lingui idPrefix="module." */
          const msg = defineMessage({ id: "greeting", message: "Hello" })
        `,
      },
      {
        name: "idPrefix does NOT apply to auto-generated id",
        code: `
          import { t } from '@lingui/core/macro';
          /* @lingui idPrefix="module." */
          const msg = t\`Hello\`
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
          /* @lingui context="my context" */
          const msg = t\`Hello\`
        `,
      },
    ],
  })
})

describe("@lingui directive: useLingui", () => {
  macroTester({
    cases: [
      {
        name: "useLingui t with directive context",
        code: `
          import { useLingui } from '@lingui/react/macro';
          function App() {
            const { t } = useLingui()
            /* @lingui context="my context" */
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
            /* @lingui context="first" */
            const msg1 = t\`Hello\`
            /* @lingui context="second" */
            const msg2 = t\`World\`
            return msg1 + msg2
          }
        `,
      },
    ],
  })
})

describe("@lingui directive: JSX macros", () => {
  macroTester({
    cases: [
      {
        name: "Trans with directive context",
        code: `
          import { Trans } from '@lingui/react/macro';
          /* @lingui context="my context" */
          const el = <Trans>Hello</Trans>
        `,
      },
      {
        name: "Trans with directive comment",
        code: `
          import { Trans } from '@lingui/react/macro';
          // @lingui comment="translator note"
          const el = <Trans>Hello</Trans>
        `,
      },
      {
        name: "Trans with explicit context overrides directive",
        code: `
          import { Trans } from '@lingui/react/macro';
          /* @lingui context="directive ctx" */
          const el = <Trans context="explicit ctx">Hello</Trans>
        `,
      },
      {
        name: "Plural with directive context",
        code: `
          import { Plural } from '@lingui/react/macro';
          /* @lingui context="my context" */
          const el = <Plural value={count} one="# book" other="# books" />
        `,
      },
      {
        name: "Select with directive context",
        code: `
          import { Select } from '@lingui/react/macro';
          /* @lingui context="my context" */
          const el = <Select value={gender} male="he" female="she" other="they" />
        `,
      },
      {
        name: "Trans with directive idPrefix and explicit id",
        code: `
          import { Trans } from '@lingui/react/macro';
          /* @lingui idPrefix="module." */
          const el = <Trans id="greeting">Hello</Trans>
        `,
      },
      {
        name: "Trans with directive idPrefix without explicit id",
        code: `
          import { Trans } from '@lingui/react/macro';
          /* @lingui idPrefix="module." */
          const el = <Trans>Hello</Trans>
        `,
      },
      {
        name: "multiple directives switching context mid-file",
        code: `
          import { Trans } from '@lingui/react/macro';
          /* @lingui context="header" */
          const h = <Trans>Title</Trans>
          /* @lingui context="footer" */
          const f = <Trans>Copyright</Trans>
        `,
      },
    ],
  })
})

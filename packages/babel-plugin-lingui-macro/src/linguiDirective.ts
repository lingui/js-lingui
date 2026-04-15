import type { Comment, ObjectProperty } from "@babel/types"
import type { TextWithLoc } from "./messageDescriptorUtils"

export type DirectiveValues = {
  context?: TextWithLoc | ObjectProperty | null
  comment?: TextWithLoc | ObjectProperty | null
  idPrefix?: string | null
}

type SortedDirective = {
  line: number
  values: DirectiveValues
  reset?: boolean
}

const DIRECTIVE_PREFIX = "@lingui"
const VALID_PARAMS = new Set<keyof DirectiveValues>([
  "context",
  "comment",
  "idPrefix",
])

const VALID_TOKEN_RE = /\s+|(\w+)(?:="([^"]*)")?/g

export function parseLinguiDirective(
  commentValue: string,
): { reset: boolean; values: DirectiveValues } | null {
  const trimmed = commentValue.trim()

  if (!trimmed.startsWith(DIRECTIVE_PREFIX)) {
    return null
  }

  const rest = trimmed.slice(DIRECTIVE_PREFIX.length)

  // Verify the entire rest string is consumed by valid tokens
  let consumed = 0
  const values: DirectiveValues = {}
  let hasParams = false
  let reset = false
  let match: RegExpExecArray | null

  VALID_TOKEN_RE.lastIndex = 0

  while ((match = VALID_TOKEN_RE.exec(rest)) !== null) {
    if (match.index !== consumed) {
      throw new Error(
        `@lingui directive has invalid syntax: ${trimmed}`
      )
    }
    consumed = match.index + match[0].length

    const key = match[1] as keyof DirectiveValues | "reset"
    if (!key) continue // whitespace-only match

    const value = match[2]

    if (key === "reset") {
      if (value !== undefined) {
        throw new Error(
          `@lingui directive: "reset" is a keyword and does not accept a value`
        )
      }
      hasParams = true
      reset = true
    } else if (VALID_PARAMS.has(key)) {
      if (value === undefined) {
        throw new Error(
          `@lingui directive: "${key}" requires a value, e.g. ${key}="..."`
        )
      }
      hasParams = true
      if (value === "") {
        values[key] = null
      } else if (key === "idPrefix") {
        values[key] = value
      } else {
        values[key] = { text: value }
      }
    } else {
      throw new Error(
        `@lingui directive has unknown param "${key}". Valid params: ${[...VALID_PARAMS].join(", ")}, reset`
      )
    }
  }

  if (consumed !== rest.length) {
    throw new Error(
      `@lingui directive has invalid syntax: ${trimmed}`
    )
  }

  if (!hasParams) {
    throw new Error(
      `@lingui directive requires at least one param. Valid params: ${[...VALID_PARAMS].join(", ")}, reset`
    )
  }

  return { reset, values }
}

export function collectLinguiDirectives(
  comments: readonly Comment[],
): SortedDirective[] {
  const directives: SortedDirective[] = []

  if (!comments?.length) return directives

  for (const comment of comments) {
    const values = parseLinguiDirective(comment.value)
    if (values) {
      directives.push({ line: comment.loc.start.line, ...values })
    }
  }

  // Comments are typically already in order, but sort to be safe
  directives.sort((a, b) => a.line - b.line)

  // Each directive carries the accumulated values of all prior
  // directives, starting from the most recent `reset`.
  // A `null` value means "unset this key" (from empty-string param).
  let accumulated: DirectiveValues = {}
  for (const d of directives) {
    if (d.reset) {
      d.values = { ...d.values }
    } else {
      d.values = { ...accumulated, ...d.values }
    }
    // Strip null entries (empty-string params used to unset keys)
    for (const k of Object.keys(d.values) as (keyof DirectiveValues)[]) {
      if (d.values[k] === null) delete d.values[k]
    }
    accumulated = d.values
  }

  return directives
}

export function findDirectiveForLine(
  directives: SortedDirective[],
  line: number,
): DirectiveValues | undefined {
  if (!directives.length) return undefined

  // Binary search for the last directive with line <= target line
  let lo = 0
  let hi = directives.length - 1
  let result = -1

  while (lo <= hi) {
    const mid = (lo + hi) >>> 1
    if (directives[mid].line <= line) {
      result = mid
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }

  return result >= 0 ? directives[result].values : undefined
}

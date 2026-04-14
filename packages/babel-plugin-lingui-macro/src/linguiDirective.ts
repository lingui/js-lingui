import type { Comment, ObjectProperty } from "@babel/types"
import type { TextWithLoc } from "./messageDescriptorUtils"

export type DirectiveValues = {
  context?: TextWithLoc | ObjectProperty
  comment?: TextWithLoc | ObjectProperty
  idPrefix?: string
}

type SortedDirective = {
  line: number
  values: DirectiveValues
}

const DIRECTIVE_PREFIX = "@lingui"
const DIRECTIVE_PARAM_RE = /(\w+)="([^"]*)"/g
const VALID_KEYS = new Set<keyof DirectiveValues>([
  "context",
  "comment",
  "idPrefix",
])

export function parseLinguiDirective(
  commentValue: string,
): DirectiveValues | null {
  const trimmed = commentValue.trim()

  if (!trimmed.startsWith(DIRECTIVE_PREFIX)) {
    return null
  }

  const rest = trimmed.slice(DIRECTIVE_PREFIX.length)

  const values: DirectiveValues = {}
  let hasValues = false
  let match: RegExpExecArray | null

  DIRECTIVE_PARAM_RE.lastIndex = 0

  while ((match = DIRECTIVE_PARAM_RE.exec(rest)) !== null) {
    const key = match[1] as keyof DirectiveValues
    const value = match[2]

    if (VALID_KEYS.has(key)) {
      if (key === "idPrefix") {
        values[key] = value
      } else {
        values[key] = { text: value }
      }
      hasValues = true
    }
  }

  return hasValues ? values : null
}

export function collectLinguiDirectives(
  comments: readonly Comment[],
): SortedDirective[] {
  const directives: SortedDirective[] = []

  if (!comments?.length) return directives

  for (const comment of comments) {
    const values = parseLinguiDirective(comment.value)
    if (values) {
      directives.push({ line: comment.loc.start.line, values })
    }
  }

  // Comments are typically already in order, but sort to be safe
  directives.sort((a, b) => a.line - b.line)

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

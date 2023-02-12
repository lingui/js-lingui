import { parse, Token } from "@messageformat/parser"
import { printICU, isPluralOrSelect } from "./printICU"

/** @internal */
export function flattenMessage(message: string): string {
  try {
    let tokens = parse(message) as Token[]
    const flattenedTokens = flattenTokens(tokens)
    return printICU(flattenedTokens)
  } catch (e) {
    console.error(`${(e as Error).message} \n\nMessage: ${message}`)
    return message
  }
}

function flattenTokens(tokens: Array<Token>): Array<Token> {
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (isPluralOrSelect(token)) {
      const cloned = cloneDeep(token)
      const { cases } = cloned
      cloned.cases = cases.reduce((all, k, index) => {
        const newValue = flattenTokens([
          ...tokens.slice(0, i),
          ...cases[index].tokens,
          ...tokens.slice(i + 1),
        ])
        all[index] = { ...k, tokens: newValue }
        return all
      }, [])

      return [cloned]
    }
  }
  return tokens
}

function cloneDeep<T>(obj: T): T {
  if (Array.isArray(obj)) {
    // @ts-expect-error
    return [...obj.map(cloneDeep)]
  }
  if (obj !== null && typeof obj === "object") {
    // @ts-expect-error
    return Object.keys(obj).reduce((cloned, k) => {
      cloned[k] = cloneDeep(obj[k])
      return cloned
    }, {})
  }
  return obj
}

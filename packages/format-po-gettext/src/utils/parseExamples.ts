/*
This script is heavily influenced by one that is used to generate plural samples
found here: https://github.com/nodeca/plurals-cldr/blob/master/support/generate.js

Ordinals were removed, and the original script supported strings and numbers,
but for the use case of lingui-gettext formatter, we only want numbers.
*/

export type ExportedGettextPluralDef = {
  name: string
  formula: string
  plurals: number
  cases: PluralForm[]
  examples: Record<PluralForm, string>
}

export type PluralForm = "zero" | "one" | "two" | "few" | "many" | "other"

// Create array of sample values for single range
// 5~16, 0.04~0.09. Both string & integer forms (when possible)
export function fillRange(value: string): number[] {
  const [start, end] = value.split("~") as [start: string, end: string]

  const decimals = (start.split(".")[1] || "").length
  // for example 0.1~0.9 has 10 values, need to add that many to list
  // 0.004~0.009 has 100 values
  const mult = Math.pow(10, decimals)

  const startNum = Number(start)
  const endNum = Number(end)

  const range = Array(Math.ceil(endNum * mult - startNum * mult + 1))
    .fill(0)
    .map((v, idx) => (idx + startNum * mult) / mult)

  const last = range[range.length - 1]

  // Number defined in the range should be the last one, i.e. 5~16 should have 16
  if (endNum !== last) {
    throw new Error(`Range create error for ${value}: last value is ${last}`)
  }

  return range.map((v) => Number(v))
}

/**
 * Parses CLDR number examples like:
 *  - "1c3"  -> 1000
 *  - "2c6"  -> 2000000
 */
function parseCompactedNumber(val: string) {
  // Match NcM (e.g. 1c3, 12c6)
  const compactMatch = /^(\d+)c(\d+)$/.exec(val)

  const base = Number(compactMatch![1])
  const power = Number(compactMatch![2])
  return base * Math.pow(10, power)
}

/**
 * Takes a string from with examples from CLDR in a form
 *
 * `0, 3~17, 100, 1000, 10000, 100000, 1000000, …`
 *
 * And produce array of number
 *
 * [0, 3, 1, 2, 3 ... 17, 100, 1000, etc]
 */
export function parseExamples(src: string): number[] {
  return src
    .replace(/…/, "")
    .trim()
    .replace(/,$/, "")
    .split(",")
    .flatMap((val) => {
      val = val.trim()
      if (val.includes("c")) {
        return parseCompactedNumber(val)
      }
      if (val.includes("~")) {
        return fillRange(val)
      }
      return Number(val)
    })
}

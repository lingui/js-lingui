import cardinals from "cldr-core/supplemental/plurals.json"

/*
This script is heavily influenced by one that is used to generate plural samples
found here: https://github.com/nodeca/plurals-cldr/blob/master/support/generate.js

Ordinals were removed, and the original script supported strings and numbers,
but for the use case of lingui-gettext formatter, we only want numbers.
*/

type PluralForm = "zero" | "one" | "two" | "few" | "many" | "other"
type FormattedRuleset = Record<PluralForm, string>

// Strip key prefixes to get clear names: zero / one / two / few / many / other
// pluralRule-count-other -> other
export function renameKeys(rules: Record<string, string>): FormattedRuleset {
  const result = {}
  Object.keys(rules).forEach((k) => {
    const newKey = k.match(/[^-]+$/)[0]
    result[newKey] = rules[k]
  })
  return result as FormattedRuleset
}

// Create array of sample values for single range
// 5~16, 0.04~0.09. Both string & integer forms (when possible)
export function fillRange(value: string): number[] {
  let [start, end] = value.split("~")

  const decimals = (start.split(".")[1] || "").length
  // for example 0.1~0.9 has 10 values, need to add that many to list
  // 0.004~0.009 has 100 values
  let mult = Math.pow(10, decimals)

  const startNum = Number(start)
  const endNum = Number(end)

  let range = Array(Math.ceil(endNum * mult - startNum * mult + 1))
    .fill(0)
    .map((v, idx) => (idx + startNum * mult) / mult)

  let last = range[range.length - 1]

  // Number defined in the range should be the last one, i.e. 5~16 should have 16
  if (endNum !== last) {
    throw new Error(`Range create error for ${value}: last value is ${last}`)
  }

  return range.map((v) => Number(v))
}

// Create array of test values for @integer or @decimal
export function createSamples(src: string): number[] {
  let result: number[] = []

  src
    .replace(/…/, "")
    .trim()
    .replace(/,$/, "")
    .split(",")
    .map(function (val) {
      return val.trim()
    })
    .forEach((val) => {
      if (val.indexOf("~") !== -1) {
        result = result.concat(fillRange(val))
      } else {
        result.push(Number(val))
      }
    })

  return result
}

// Create fixtures for single locale rules
export function createLocaleTest(rules) {
  let result = {}

  Object.keys(rules).forEach((form) => {
    let samples = rules[form].split(/@integer|@decimal/).slice(1)

    result[form] = []
    samples.forEach((sample) => {
      result[form] = result[form].concat(createSamples(sample))
    })
  })

  return result
}

export function getCldrPluralSamples(): Record<
  string,
  Record<PluralForm, number[]>
> {
  const pluralRules = {}

  // Parse plural rules
  Object.entries(cardinals.supplemental["plurals-type-cardinal"]).forEach(
    ([loc, ruleset]) => {
      let rules = renameKeys(ruleset)

      pluralRules[loc.toLowerCase()] = createLocaleTest(rules)
    }
  )

  return pluralRules
}

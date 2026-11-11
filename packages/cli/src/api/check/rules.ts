import type { CheckRuleLevel, LinguiConfigNormalized } from "@lingui/conf"
import type {
  CheckConfigOptions,
  CheckDefinition,
  CheckFinding,
  CheckLevel,
  CheckSeverity,
} from "./types.js"

export type ResolvedCheckRule = {
  level: CheckRuleLevel
  options: CheckConfigOptions
}

const checkRuleLevels: readonly CheckRuleLevel[] = [
  "off",
  "on",
  "warn",
  "error",
]

function isCheckRuleLevel(value: unknown): value is CheckRuleLevel {
  return checkRuleLevels.includes(value as CheckRuleLevel)
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function hasOwn(object: object, key: string) {
  return Object.prototype.hasOwnProperty.call(object, key)
}

function formatValues(values: readonly string[]) {
  return values.map((value) => `\`${value}\``).join(", ")
}

/**
 * Throws if `check.rules` of the config refers to a check which doesn't exist
 * or if any of the rules is invalid.
 */
export function validateCheckRules(
  config: LinguiConfigNormalized,
  checks: readonly CheckDefinition[],
) {
  const rules = config.check?.rules

  if (rules == null) {
    return
  }

  if (!isPlainObject(rules)) {
    throw new Error("Config option `check.rules` must be an object.")
  }

  const names = checks.map((check) => check.name)
  const unknown = Object.keys(rules).find(
    (name) => !names.includes(name as any),
  )

  if (unknown) {
    throw new Error(
      `Unknown check \`${unknown}\` in config option \`check.rules\`. Available checks: ${formatValues(names)}.`,
    )
  }

  checks.forEach((check) => resolveCheckRule(config, check))
}

function resolveRuleOptions(
  check: CheckDefinition,
  options: unknown,
): CheckConfigOptions {
  const configPath = `check.rules.${check.name}.options`

  if (options == null) {
    return {}
  }

  if (!isPlainObject(options)) {
    throw new Error(`Config option \`${configPath}\` must be an object.`)
  }

  const resolved: Record<string, unknown> = {}

  for (const [name, value] of Object.entries(options)) {
    const definition = check.cli.options.find((option) => option.name === name)

    if (!definition) {
      throw new Error(
        `Unknown option \`${name}\` in config option \`${configPath}\`. Available options: ${formatValues(check.cli.options.map((option) => option.name))}.`,
      )
    }

    if (value === undefined) {
      continue
    }

    if (definition.choices) {
      if (typeof value !== "string" || !definition.choices.includes(value)) {
        throw new Error(
          `Config option \`${configPath}.${name}\` must be one of ${formatValues(definition.choices)}.`,
        )
      }
    } else if (typeof value !== "boolean") {
      throw new Error(
        `Config option \`${configPath}.${name}\` must be a boolean.`,
      )
    }

    resolved[definition.runOption] = value
  }

  return resolved
}

/**
 * Reads the rule of the check from `check.rules` in the lingui config.
 * A check without a rule is `on`.
 */
export function resolveCheckRule(
  config: LinguiConfigNormalized,
  check: CheckDefinition,
): ResolvedCheckRule {
  const rules = config.check?.rules
  const rule: unknown =
    rules && hasOwn(rules, check.name) ? rules[check.name] : undefined
  const levelPath = `check.rules.${check.name}`

  if (rule === undefined) {
    return { level: "on", options: {} }
  }

  if (typeof rule === "string") {
    if (!isCheckRuleLevel(rule)) {
      throw new Error(
        `Config option \`${levelPath}\` must be one of ${formatValues(checkRuleLevels)}.`,
      )
    }

    return { level: rule, options: {} }
  }

  if (!isPlainObject(rule)) {
    throw new Error(
      `Config option \`${levelPath}\` must be a level or an object with \`level\` and \`options\`.`,
    )
  }

  const level = rule.level ?? "on"

  if (!isCheckRuleLevel(level)) {
    throw new Error(
      `Config option \`${levelPath}.level\` must be one of ${formatValues(checkRuleLevels)}.`,
    )
  }

  return { level, options: resolveRuleOptions(check, rule.options) }
}

/**
 * `on` takes the severity recommended by the check for each kind of problem,
 * `warn` and `error` apply to all of them.
 */
export function getFindingSeverity(
  check: CheckDefinition,
  level: CheckLevel,
  finding: CheckFinding,
): CheckSeverity {
  if (level === "on") {
    return check.problems[finding.code] ?? "error"
  }

  return level
}

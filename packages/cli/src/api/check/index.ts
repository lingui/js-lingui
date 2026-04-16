import { missingCheck } from "./missing.js"
import { syncCheck } from "./sync.js"
import {
  CheckDefinition,
  CheckName,
  CheckRunOptions,
  CheckSpecificOption,
  checkSpecificOptions,
} from "./types.js"

const registeredChecks = [
  syncCheck,
  missingCheck,
] as const satisfies readonly CheckDefinition[]

export const checkDefinitionsByName: Record<CheckName, CheckDefinition> =
  Object.fromEntries(
    registeredChecks.map((check) => [check.name, check]),
  ) as Record<CheckName, CheckDefinition>

export function getRegisteredChecks(): readonly CheckDefinition[] {
  return registeredChecks
}

function getSupportedOptions(check: CheckDefinition) {
  return check.cli.options.map((option) => option.name)
}

function findSupportedCheck(option: CheckSpecificOption): CheckName {
  const supportedCheck = registeredChecks.find((check) =>
    getSupportedOptions(check).includes(option),
  )?.name

  if (!supportedCheck) {
    throw new Error(`Unsupported check option \`${option}\`.`)
  }

  return supportedCheck
}

export function validateSupportedOptions(
  check: CheckDefinition,
  options: CheckRunOptions,
) {
  checkSpecificOptions.forEach((option) => {
    if (!options[option] || getSupportedOptions(check).includes(option)) {
      return
    }

    const supportedCheck = findSupportedCheck(option)

    throw new Error(
      `Option \`--${option}\` can only be used with the \`${supportedCheck}\` check.`,
    )
  })
}

export function getCheck(inputCheck: string): CheckDefinition {
  if (!(inputCheck in checkDefinitionsByName)) {
    throw new Error(`Unknown check ${inputCheck}.`)
  }

  return checkDefinitionsByName[inputCheck as CheckName]
}

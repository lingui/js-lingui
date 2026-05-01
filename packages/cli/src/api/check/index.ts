import { missingCheck } from "./missing.js"
import { syncCheck } from "./sync.js"
import {
  CheckDefinition,
  CheckName,
  CheckRunOptions,
  CheckSpecificOption,
  checkSpecificOptions,
} from "./types.js"

export const checkDefinitionsByName = {
  sync: syncCheck,
  missing: missingCheck,
} satisfies Record<CheckName, CheckDefinition>

const registeredChecks: readonly CheckDefinition[] = [
  checkDefinitionsByName.sync,
  checkDefinitionsByName.missing,
]

export function getRegisteredChecks(): readonly CheckDefinition[] {
  return registeredChecks
}

function getSupportedOptions(check: CheckDefinition) {
  return check.cli.options.map((option) => option.runOption)
}

function getCliOptionName(option: CheckSpecificOption) {
  for (const check of registeredChecks) {
    const cliOption = check.cli.options.find(
      (currentOption) => currentOption.runOption === option,
    )

    if (cliOption) {
      return cliOption.name
    }
  }

  return option
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
    const cliOptionName = getCliOptionName(option)

    throw new Error(
      `Option \`--${cliOptionName}\` can only be used with the \`${supportedCheck}\` check.`,
    )
  })
}

function isCheckName(inputCheck: string): inputCheck is CheckName {
  return inputCheck === "sync" || inputCheck === "missing"
}

export function getCheck(inputCheck: string): CheckDefinition {
  if (!isCheckName(inputCheck)) {
    throw new Error(`Unknown check ${inputCheck}.`)
  }

  return checkDefinitionsByName[inputCheck]
}

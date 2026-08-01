import { missingCheck } from "./missing.js"
import { syncCheck } from "./sync.js"
import {
  CheckCliOptionName,
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

const registeredChecks: readonly CheckDefinition[] = Object.values(
  checkDefinitionsByName,
)

export function getRegisteredChecks(): readonly CheckDefinition[] {
  return registeredChecks
}

function getSupportedOptions(check: CheckDefinition) {
  return check.cli.options.map((option) => option.runOption)
}

type OptionOwner = { checkName: CheckName; cliOptionName: CheckCliOptionName }

const optionOwnerByOption: ReadonlyMap<CheckSpecificOption, OptionOwner> =
  new Map(
    registeredChecks.flatMap((check) =>
      check.cli.options.map(
        (option) =>
          [
            option.runOption,
            { checkName: check.name, cliOptionName: option.name },
          ] as const,
      ),
    ),
  )

export function validateSupportedOptions(
  check: CheckDefinition,
  options: CheckRunOptions,
) {
  checkSpecificOptions.forEach((option) => {
    if (!options[option] || getSupportedOptions(check).includes(option)) {
      return
    }

    const owner = optionOwnerByOption.get(option)

    if (!owner) {
      throw new Error(`Unsupported check option \`${option}\`.`)
    }

    throw new Error(
      `Option \`--${owner.cliOptionName}\` can only be used with the \`${owner.checkName}\` check.`,
    )
  })
}

function isCheckName(inputCheck: string): inputCheck is CheckName {
  return inputCheck in checkDefinitionsByName
}

export function getCheck(inputCheck: string): CheckDefinition {
  if (!isCheckName(inputCheck)) {
    throw new Error(`Unknown check ${inputCheck}.`)
  }

  return checkDefinitionsByName[inputCheck]
}

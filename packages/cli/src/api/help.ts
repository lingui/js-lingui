/**
 * Detect where is the command lingui extract or lingui compile
 * and how is being run (npm, yarn, pnpm) and construct help
 * for follow-up commands based on that.
 *
 * Example:
 * $ yarn extract
 * ...
 * (use "yarn compile" to compile catalogs for production)
 *
 * $ yarn lingui extract
 * ...
 * (use "yarn lingui compile" to compile catalogs for production)
 *
 * $ pnpm run extract
 * ...
 * (use "pnpm run compile" to compile catalogs for production)
 *
 * $ npm run extract
 * ...
 * (use "npm run compile" to compile catalogs for production)
 */
import { resolve, join } from "path"

export function helpRun(command: string) {
  let findRootPkgJson: Record<string, unknown>
  try {
    findRootPkgJson = require(resolve(join(process.cwd(), "package.json")))
  } catch (error) {}

  if (findRootPkgJson?.scripts) {
    const res = Object.entries(findRootPkgJson.scripts).find(([_, value]) =>
      value.includes(`lingui ${command}`)
    )

    if (res) {
      command = res[0]
    }
  }

  const runCommand = runCommandFrom(process.env.npm_config_user_agent)

  return `${runCommand} ${command}`
}

function runCommandFrom(userAgent: string | undefined): string {
  const defaultRunCommand = "npm run"

  if (!userAgent) {
    return defaultRunCommand
  }

  if (userAgent.includes("yarn")) {
    return "yarn"
  }

  if (userAgent.includes("pnpm")) {
    return "pnpm run"
  }

  return defaultRunCommand
}

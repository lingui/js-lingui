/**
 * Detect where's is the command lingui extract or lingui compile
 * and how is being run (npm, yarn) and construct help
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
 * $ npm run extract
 * ...
 * (use "npm run compile" to compile catalogs for production)
 */
import path from "path"

export function helpRun(command: string) {
  let findRootPkgJson: Record<string, unknown>;
  try {
    findRootPkgJson = require(path.resolve(
      path.join(process.cwd(), "package.json")
    ))
  } catch (error) {}

  if (findRootPkgJson?.scripts) {
    const res = Object
      .entries(findRootPkgJson.scripts)
      .find(([_, value]) => value.includes(`lingui ${command}`))

    if (res[0]) {
      return `${preCommand} ${res[0]}`
    }
  }

  return `${preCommand} ${command}`
}

let commands
try {
  commands = JSON.parse(process.env.npm_config_argv).original.slice(0, -1)
} catch (e) {
  commands = ["run"]
}
const isYarn =
  process.env.npm_config_user_agent &&
  process.env.npm_config_user_agent.includes("yarn")
const preCommand = [isYarn ? "yarn" : "npm", ...commands].join(" ")

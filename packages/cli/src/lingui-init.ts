import path from "path"
import fs from "fs"
import program from "commander"
import { execSync } from "child_process"
import inquirer from "inquirer"
import chalk from "chalk"

import { projectType, detect } from "./api/detect"

function hasYarn() {
  return fs.existsSync(path.resolve("yarn.lock"))
}

export function makeInstall() {
  const withYarn = hasYarn()

  return (packageName: string, dev: boolean = false) =>
    withYarn
      ? `yarn add ${dev ? "--dev " : ""}${packageName}`
      : `npm install ${dev ? "--save-dev" : "--save"} ${packageName}`
}

export async function installPackages(dryRun: boolean) {
  const install = makeInstall()

  const type = detect()
  const usesReact = type === projectType.CRA || type === projectType.REACT

  const commonPackages = [
    ["@lingui/macro", true],
    ["babel-plugin-macros", true]
  ]
  const packages = [
    ...(usesReact
      ? [["@lingui/react"], ...commonPackages]
      : [["@lingui/core"], ...commonPackages])
  ].filter(Boolean)

  const verbosePackages = packages
    .map(([packageName]) => chalk.yellow(packageName))
    .join(", ")
  const { confirm } = await inquirer.prompt({
    type: "confirm",
    name: "confirm",
    message: `Do you want to install ${verbosePackages}?`
  })

  if (!confirm) return false

  const commands = packages.map(([packageName, dev]) =>
    install(packageName, dev)
  )
  if (dryRun) {
    commands.forEach(command => console.log(command))
  } else {
    commands.forEach(command => execSync(command))
  }

  return true
}

type CommandInit = {
  dryRun: boolean
}

export async function command(program) {
  await installPackages(program.dryRun)

  return true
}

if (require.main === module) {
  program
    .option(
      "--dry-run",
      "Output commands that would be run, but don't execute them."
    )
    .parse(process.argv)

  command(program)
}

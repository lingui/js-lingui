// @flow
import path from "path"
import fs from "fs"
import program from "commander"
import { execSync } from "child_process"

import { projectType, detect } from "./api/detect"

function hasYarn() {
  return fs.existsSync(path.resolve("yarn.lock"))
}

function makeInstall() {
  const withYarn = hasYarn()

  return (packageName, dev = false) =>
    withYarn
      ? `yarn add ${dev ? "--dev " : ""}${packageName}`
      : `npm install ${dev ? "--save-dev" : "--save"} ${packageName}`
}

type CommandInit = {|
  dryRun: boolean
|}

export function command(program: CommandInit) {
  const install = makeInstall()

  const type = detect()
  const usesReact = type === projectType.CRA || type === projectType.REACT

  const commands = [
    ...(usesReact
      ? [install("@lingui/react"), install("@lingui/babel-preset-react", true)]
      : [install("@lingui/core"), install("@lingui/babel-preset-js", true)])
  ].filter(Boolean)

  if (program.dryRun) {
    commands.forEach(command => console.log(command))
  } else {
    commands.forEach(command => execSync(command))
  }

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

import fs from "fs"
import path from "path"
import chalk from "chalk"
import { score } from "fuzzaldrin"

export function removeDirectory(dir, onlyContent = false) {
  if (!fs.existsSync(dir)) return
  const list = fs.readdirSync(dir)

  for (let i = 0; i < list.length; i++) {
    const filename = path.join(dir, list[i])
    const stat = fs.statSync(filename)

    if (filename === "." || filename === "..") {
      // pass these files
    } else if (stat.isDirectory()) {
      // rmdir recursively
      removeDirectory(filename)
    } else {
      fs.unlinkSync(filename)
    }
  }

  if (!onlyContent) {
    fs.rmdirSync(dir)
  }
}

export function prettyOrigin(origins) {
  try {
    return origins.map((origin) => origin.join(":")).join(", ")
  } catch (e) {
    return ""
  }
}

/**
 * .. js:function:: helpMisspelledCommand(command [, availableCommands = []])
 *    :param: command - command passed to CLI
 *    :param: availableCommands - all commands defined in commander.js
 *
 *    If unknown commands is passed to CLI, check it agains all available commands
 *    for possible misspelled letter. Output help with suggestions to console.
 */
export function helpMisspelledCommand(command, availableCommands = []) {
  const commandNames = availableCommands.map((command) => command.name())

  // if no command is supplied, then commander.js shows help automatically
  if (!command || commandNames.includes(command)) {
    return
  }

  const suggestions = commandNames
    .map((name) => ({
      name,
      score: score(name, command.slice(0, name.length)),
    }))
    .filter((nameScore) => nameScore.score > 0)
    .slice(0, 3)
    .map((commandScore) => chalk.inverse(commandScore.name))
    .join(", ")

  console.log(
    `lingui: command ${command} is not a lingui command. ` +
      `See 'lingui --help' for the list of available commands.`
  )

  if (suggestions) {
    console.log()
    console.log(`Did you mean: ${suggestions}?`)
  }
}

export const splitOrigin = (origin) => origin.split(":")

export const joinOrigin = (origin) => origin.join(":")

export function writeFileIfChanged(filename, newContent) {
  if (fs.existsSync(filename)) {
    const raw = fs.readFileSync(filename).toString()
    if (newContent !== raw) {
      fs.writeFileSync(filename, newContent)
    }
  } else {
    fs.writeFileSync(filename, newContent)
  }
}

export function hasYarn() {
  return fs.existsSync(path.resolve("yarn.lock"))
}

export function makeInstall() {
  const withYarn = hasYarn()

  return (packageName: string, dev: boolean = false) =>
    withYarn
      ? `yarn add ${dev ? "--dev " : ""}${packageName}`
      : `npm install ${dev ? "--save-dev" : "--save"} ${packageName}`
}

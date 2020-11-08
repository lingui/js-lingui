import fs from "fs"
import path from "path"
import chalk from "chalk"
import ora from "ora"
import * as R from "ramda"

import { prettyOrigin } from "./utils"

import * as extractors from "./extractors"
import { ExtractorType } from "./extractors"


type ExtractOptions = {
  ignore?: Array<string>
  verbose?: boolean
  projectType?: string
  babelOptions?: Object
}

/**
 * Merge origins for messages found in different places. All other attributes
 * should be the same (raise an error if defaults are different).
 */
function mergeMessage(msgId, prev, next) {
  if (prev.message && next.message && prev.message !== next.message) {
    throw new Error(
      `Encountered different default translations for message ${chalk.yellow(
        msgId
      )}` +
        `\n${chalk.yellow(prettyOrigin(prev.origin))} ${prev.message}` +
        `\n${chalk.yellow(prettyOrigin(next.origin))} ${next.message}`
    )
  }

  return {
    ...next,
    message: prev.message || next.message,
    origin: R.concat(prev.origin, next.origin),
  }
}

export function extract(
  srcPaths: Array<string>,
  targetPath: string,
  options: ExtractOptions = {}
) {
  const { ignore = [], verbose = false } = options
  const ignorePattern = ignore.length ? new RegExp(ignore.join("|"), "i") : null

  srcPaths.forEach((srcFilename) => {
    if (
      !fs.existsSync(srcFilename) ||
      (ignorePattern && ignorePattern.test(srcFilename))
    )
      return

    if (fs.statSync(srcFilename).isDirectory()) {
      const subdirs = fs
        .readdirSync(srcFilename)
        .sort()
        .map((filename) => path.join(srcFilename, filename))

      extract(subdirs, targetPath, options)
      return
    }

    R.values(extractors).some((ext: ExtractorType) => {
      if (!ext.match || !ext.match(srcFilename)) return false

      let spinner
      if (verbose) spinner = ora().start(srcFilename)

      ext.extract(srcFilename, targetPath, options)
      if (verbose && spinner) spinner.succeed()

      return true
    })
  })
}

export function collect(buildDir: string) {
  return fs
    .readdirSync(buildDir)
    .sort()
    .map((filename) => {
      const filepath = path.join(buildDir, filename)

      if (fs.lstatSync(filepath).isDirectory()) {
        return collect(filepath)
      }

      if (!filename.endsWith(".json")) return

      try {
        return JSON.parse(fs.readFileSync(filepath).toString())
      } catch (e) {
        return {}
      }
    })
    .filter(Boolean)
    .reduce(
      (catalog, messages) => R.mergeWithKey(mergeMessage, catalog, messages),
      {}
    )
}

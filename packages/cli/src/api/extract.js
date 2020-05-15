// @flow
import fs from "fs"
import path from "path"
import chalk from "chalk"
import ora from "ora"
import R from "ramda"

import { prettyOrigin } from "./utils"

import * as extractors from "./extractors"
import type { ExtractorType } from "./extractors"
import type { AllCatalogsType, Sorting } from "./types"

type ExtractOptions = {
  ignore?: Array<string>,
  verbose?: boolean,
  babelOptions?: Object
}

/**
 * Merge origins for messages found in different places. All other attributes
 * should be the same (raise an error if defaults are different).
 */
function mergeMessage(msgId, prev, next) {
  if (prev.defaults && next.defaults && prev.defaults !== next.defaults) {
    throw new Error(
      `Encountered different defaults for message ${chalk.yellow(msgId)}` +
        `\n${chalk.yellow(prettyOrigin(prev.origin))} ${prev.defaults}` +
        `\n${chalk.yellow(prettyOrigin(next.origin))} ${next.defaults}`
    )
  }

  return {
    ...next,
    defaults: prev.defaults || next.defaults,
    origin: R.concat(prev.origin, next.origin)
  }
}

export function extract(
  srcPaths: Array<string>,
  targetPath: string,
  options: ExtractOptions = {}
) {
  const { ignore = [], verbose = false } = options
  const ignorePattern = ignore.length ? new RegExp(ignore.join("|"), "i") : null

  srcPaths.forEach(srcFilename => {
    if (
      !fs.existsSync(srcFilename) ||
      (ignorePattern && ignorePattern.test(srcFilename))
    )
      return

    if (fs.statSync(srcFilename).isDirectory()) {
      const subdirs = fs
        .readdirSync(srcFilename)
        .sort()
        .map(filename => path.join(srcFilename, filename))

      extract(subdirs, targetPath, options)
      return
    }

    const extracted = R.values(extractors).some((ext: ExtractorType) => {
      if (!ext.match(srcFilename)) return false

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
    .map(filename => {
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

export function cleanObsolete(catalogs: AllCatalogsType) {
  return R.map(
    R.filter(message => !message.obsolete),
    catalogs
  )
}

export function order(catalogs: AllCatalogsType, by: Sorting) {
  if (by === "messageId") {
    return R.map(orderByMessageId, catalogs)
  }

  if (by === "origin") {
    return R.map(orderByOrigin, catalogs)
  }

  throw new Error("Invalid order by")
}

function orderByMessageId(messages) {
  const orderedMessages = {}
  Object.keys(messages)
    .sort()
    .forEach(function(key) {
      orderedMessages[key] = messages[key]
    })

  return orderedMessages
}

function orderByOrigin(messages) {
  function getFirstOrigin(messageKey) {
    const sortedOrigins = messages[messageKey].origin.sort((a, b) => {
      if (a[0] < b[0]) return -1
      if (a[0] > b[0]) return 1
      return 0
    })
    return sortedOrigins[0]
  }

  return Object.keys(messages)
    .sort(function(a, b) {
      const [aFile, aLineNumber] = getFirstOrigin(a)
      const [bFile, bLineNumber] = getFirstOrigin(b)

      if (aFile < bFile) return -1
      if (aFile > bFile) return 1

      if (aLineNumber < bLineNumber) return -1
      if (aLineNumber > bLineNumber) return 1

      return 0
    })
    .reduce((acc, key) => {
      acc[key] = messages[key]
      return acc
    }, {})
}

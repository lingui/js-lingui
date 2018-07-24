// @flow
import fs from "fs"
import path from "path"
import chalk from "chalk"
import ora from "ora"
import R from "ramda"

import * as extractors from "./extractors"
import type { ExtractorType } from "./extractors"
import type { AllCatalogsType } from "./formats/types"

type ExtractOptions = {
  ignore?: Array<string>,
  verbose?: boolean,
  babelOptions?: Object
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

    if (fs.lstatSync(srcFilename).isDirectory()) {
      const subdirs = fs
        .readdirSync(srcFilename)
        .map(filename => path.join(srcFilename, filename))

      extract(subdirs, targetPath, options)
      return
    }

    const extracted = R.values(extractors).some((ext: ExtractorType) => {
      if (!ext.match(srcFilename)) return false

      let spinner
      if (verbose) spinner = ora().start(srcFilename)

      ext.extract(srcFilename, targetPath, options.babelOptions)
      if (verbose && spinner) spinner.succeed()

      return true
    })
  })
}

export function collect(buildDir: string) {
  return fs
    .readdirSync(buildDir)
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
    .reduce((catalog, messages) => {
      const mergeMessage = (msgId, prev, next) => {
        if (prev.defaults !== next.defaults) {
          const prettyOrigin = args => {
            try {
              return chalk.yellow(args[0].join(":"))
            } catch (e) {
              return ""
            }
          }

          throw new Error(
            `Encountered different defaults for message ${chalk.yellow(
              msgId
            )}` +
              `\n${prettyOrigin(prev.origin)} ${prev.defaults}` +
              `\n${prettyOrigin(next.origin)} ${next.defaults}`
          )
        }

        return {
          ...next,
          origin: R.concat(prev.origin, next.origin)
        }
      }
      return R.mergeWithKey(mergeMessage, catalog, messages)
    }, {})
}

export function cleanObsolete(catalogs: AllCatalogsType) {
  return R.map(R.filter(message => !message.obsolete), catalogs)
}

export function order(catalogs: AllCatalogsType) {
  return R.map(orderByMessageId, catalogs)
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

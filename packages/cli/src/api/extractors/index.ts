import ora from "ora"
import babel from "./babel"
import typescript from "./typescript"
import * as R from "ramda"
import { ExtractorType } from "./types"

const extractors = { babel, typescript }

type ExtractOptions = {
  verbose: boolean
  projectType: string
  babelOptions?: Object
}

export default function extract(
  filename: string,
  targetPath: string,
  options: ExtractOptions
): boolean {
  return R.values(extractors).some((ext: ExtractorType) => {
    if (!ext.match(filename)) return false

    let spinner
    if (options.verbose) spinner = ora().start(filename)

    try {
      ext.extract(filename, targetPath, options)
    } catch (e) {
      if (options.verbose && spinner) {
        spinner.fail(e.message)
      } else {
        console.error(`Cannot process file ${e.message}`)
      }
      return true
    }

    if (options.verbose && spinner) spinner.succeed()
    return true
  })
}

export { babel, typescript }

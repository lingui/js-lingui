import ora from "ora"
import babel from "./babel"
import typescript from "./typescript"
import * as R from "ramda"

const extractors = { babel, typescript }


export type BabelOptions = {
  plugins?: Array<string>
  presets?: Array<string>
}

export type ExtractOptions = {
  verbose?: boolean
  projectType?: string
  babelOptions?: BabelOptions
}

export type ExtractorType = {
  match(filename: string): boolean
  extract(filename: string, targetDir: string, options?: ExtractOptions): void
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

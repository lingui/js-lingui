import ora from "ora"
import babel from "./babel"

const DEFAULT_EXTRACTORS: ExtractorType[] = [babel]

export type BabelOptions = {
  plugins?: Array<string>
  presets?: Array<string>
}

export type ExtractOptions = {
  verbose?: boolean
  projectType?: string
  configPath?: string
  extractors?: ExtractorType[]
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
  const extractorsToExtract = options.extractors ?? DEFAULT_EXTRACTORS

  return extractorsToExtract.some((e) => {
    let ext: ExtractorType = e;
    if (typeof e === "string") {
      // in case of the user using require.resolve in their extractors, we require that module
      ext = require(e)
    }
    if ((ext as any).default) {
      ext = (ext as any).default
    }

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

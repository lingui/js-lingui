import ora from "ora"
import babel from "./babel"

const DEFAULT_EXTRACTORS: ExtractorType[] = [babel]

export type BabelOptions = {
  plugins?: Array<string>
  presets?: Array<string>
}

export type ExtractedMessage = {
  id: string

  message?: string
  context?: string
  origin?: [filename: string, line: number]

  comment?: string
}

export type ExtractOptions = {
  verbose?: boolean
  projectType?: string
  extractors?: ExtractorType[]
  babelOptions?: BabelOptions
}

export type ExtractorType = {
  match(filename: string): boolean
  extract(
    filename: string,
    onMessageExtracted: (msg: ExtractedMessage) => void,
    options?: ExtractOptions
  ): Promise<void> | void
}

export default async function extract(
  filename: string,
  onMessageExtracted: (msg: ExtractedMessage) => void,
  options: ExtractOptions
): Promise<boolean> {
  const extractorsToExtract = options.extractors ?? DEFAULT_EXTRACTORS

  for (let e of extractorsToExtract) {
    let ext: ExtractorType = e
    if (typeof e === "string") {
      // in case of the user using require.resolve in their extractors, we require that module
      ext = require(e)
    }
    if ((ext as any).default) {
      ext = (ext as any).default
    }

    if (!ext.match(filename)) continue

    let spinner
    if (options.verbose) spinner = ora().start(filename)

    try {
      await ext.extract(filename, onMessageExtracted, options)

      if (options.verbose && spinner) spinner.succeed()
      return true
    } catch (e) {
      if (options.verbose && spinner) {
        spinner.fail((e as Error).message)
      } else {
        console.error(`Cannot process file ${(e as Error).message}`)
        console.error((e as Error).stack)
      }
      return false
    }
  }

  return true
}

import fs from "fs/promises"
import babel from "./babel"

const DEFAULT_EXTRACTORS: ExtractorType[] = [babel]

export type ParserOptions = {
  decoratorsBeforeExport?: boolean
  flow?: boolean
}

export type ExtractedMessage = {
  id: string

  message?: string
  context?: string
  origin?: [filename: string, line: number]

  comment?: string
}

type ExtractOptions = {
  extractors?: ExtractorType[]
  parserOptions?: ParserOptions
}

export type ExtractorOptions = {
  parserOptions?: ParserOptions
  sourceMaps?: any
}

export type ExtractorType = {
  match(filename: string): boolean
  extract(
    filename: string,
    code: string,
    onMessageExtracted: (msg: ExtractedMessage) => void,
    options?: ExtractorOptions
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

    try {
      const file = await fs.readFile(filename)
      await ext.extract(filename, file.toString(), onMessageExtracted, {
        parserOptions: options.parserOptions,
      })
      return true
    } catch (e) {
      console.error(`Cannot process file ${(e as Error).message}`)
      console.error((e as Error).stack)
      return false
    }
  }

  return true
}

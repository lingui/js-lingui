import fs from "fs/promises"
import babel from "./babel"
import {
  ExtractedMessage,
  ExtractorType,
  LinguiConfigNormalized,
} from "@lingui/conf"

const DEFAULT_EXTRACTORS: ExtractorType[] = [babel]

type ExtractOptions = {
  extractors?: ExtractorType[]
}

export default async function extract(
  filename: string,
  onMessageExtracted: (msg: ExtractedMessage) => void,
  linguiConfig: LinguiConfigNormalized,
  options: ExtractOptions
): Promise<boolean> {
  const extractorsToExtract = options.extractors ?? DEFAULT_EXTRACTORS

  for (let e of extractorsToExtract) {
    let ext: ExtractorType = e
    // if (typeof e === "string") {
    //   // in case of the user using require.resolve in their extractors, we require that module
    //   /* @vite-ignore */
    //   ext = require(e)
    // }
    if ((ext as any).default) {
      ext = (ext as any).default
    }

    if (!ext.match(filename)) continue

    try {
      const file = await fs.readFile(filename)
      await ext.extract(filename, file.toString(), onMessageExtracted, {
        linguiConfig,
      })
      return true
    } catch (e) {
      console.error(`Cannot process file ${filename} ${(e as Error).message}`)
      console.error((e as Error).stack)
      return false
    }
  }

  return true
}

import fs from "fs/promises"
import babel from "./babel.js"
import {
  ExtractedMessage,
  ExtractorType,
  LinguiConfigNormalized,
} from "@lingui/conf"

const DEFAULT_EXTRACTORS: ExtractorType[] = [babel]

export default async function extract(
  filename: string,
  onMessageExtracted: (msg: ExtractedMessage) => void,
  linguiConfig: LinguiConfigNormalized
): Promise<boolean> {
  const extractorsToExtract = linguiConfig.extractors ?? DEFAULT_EXTRACTORS

  for (const ext of extractorsToExtract) {
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

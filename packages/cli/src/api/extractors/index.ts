import fs from "fs/promises"
import { createBabelExtractor } from "./babel.js"
import {
  ExtractedMessage,
  ExtractorType,
  LinguiConfigNormalized,
  PerFileExtractorType,
} from "@lingui/conf"

let defaultExtractor: ExtractorType
function createDefaultExtractor(linguiConfig: LinguiConfigNormalized) {
  if (!defaultExtractor) {
    defaultExtractor = createBabelExtractor({
      parserOptions: linguiConfig.extractorParserOptions,
    })
  }
  return defaultExtractor
}

export const getConfiguredExtractors = (
  linguiConfig: LinguiConfigNormalized,
) => {
  return linguiConfig.extractors ?? [createDefaultExtractor(linguiConfig)]
}

export default async function extract(
  filename: string,
  onMessageExtracted: (msg: ExtractedMessage) => void,
  linguiConfig: LinguiConfigNormalized,
): Promise<boolean> {
  const extractorsToExtract = getConfiguredExtractors(linguiConfig).filter(
    (ext): ext is PerFileExtractorType => "extract" in ext,
  )

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

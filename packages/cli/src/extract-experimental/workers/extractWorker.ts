import {
  ExtractedMessage,
  getConfig,
  LinguiConfigNormalized,
} from "@lingui/conf"
import { extractFromChunk } from "../extractFromChunk.js"

export type ExtractWorkerFunction = typeof extractWorker

let linguiConfig: LinguiConfigNormalized | undefined

const extractWorker = async (
  linguiConfigPath: string,
  bundleFile: string,
): Promise<{ success: boolean; messages: ExtractedMessage[] }> => {
  if (!linguiConfig) {
    linguiConfig = getConfig({
      configPath: linguiConfigPath,
      skipValidation: true,
    })
  }

  return await extractFromChunk(bundleFile, linguiConfig)
}

export { extractWorker }

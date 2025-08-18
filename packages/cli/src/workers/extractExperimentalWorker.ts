import { expose } from "threads/worker"
import type {
  ExtractedMessage,
  LinguiConfigNormalized,
} from "@lingui/conf"

import { experimentalExtractor } from "../api/extractors/babel"

export type ExtractExperimentalWorkerFunction = (
  filename: string,
  fileContent: string,
  linguiConfig: Omit<LinguiConfigNormalized, 'extractors'>
) => Promise<{ messages?: ExtractedMessage[], error?: Error }>

const extractExperimentalWorker: ExtractExperimentalWorkerFunction = async (filename, fileContent, linguiConfig) => {
  try {
    const messages: ExtractedMessage[] = []
    
    const onMessageExtracted = (msg: ExtractedMessage) => {
      messages.push(msg)
    }

    try {
      await experimentalExtractor.extract(filename, fileContent, onMessageExtracted, {
        linguiConfig: linguiConfig as LinguiConfigNormalized,
      })
    } catch (e) {
      return { error: new Error(`Experimental extractor error for ${filename}: ${(e as Error).message}`) }
    }

    return { messages }
  } catch (error) {
    return { error: error as Error }
  }
}

expose(extractExperimentalWorker)
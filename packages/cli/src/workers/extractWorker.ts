import { expose } from "threads/worker"
import type {
  ExtractedMessage,
  LinguiConfigNormalized,
} from "@lingui/conf"

import { DEFAULT_EXTRACTORS } from "../api/catalog/extractFromFiles"

export type ExtractWorkerFunction = (
  filename: string,
  fileContent: string,
  linguiConfig: Omit<LinguiConfigNormalized, 'extractors'>
) => Promise<{ messages?: ExtractedMessage[], error?: Error }>

const extractWorker: ExtractWorkerFunction = async (filename, fileContent, linguiConfig) => {
  try {
    const messages: ExtractedMessage[] = []
    
    const onMessageExtracted = (msg: ExtractedMessage) => {
      messages.push(msg)
    }

    let hasMatch = false
    for (const ext of DEFAULT_EXTRACTORS) {
      if (!ext.match(filename)) continue
      hasMatch = true
      
      try {
        await ext.extract(filename, fileContent, onMessageExtracted, {
          linguiConfig: linguiConfig as LinguiConfigNormalized,
        })
      } catch (e) {
        return { error: new Error(`Extractor error for ${filename}: ${(e as Error).message}`) }
      }
    }

    if (!hasMatch) {
      return { messages: [] }
    }

    return { messages }
  } catch (error) {
    return { error: error as Error }
  }
}

expose(extractWorker)
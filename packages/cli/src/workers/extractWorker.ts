import { expose } from "threads/worker"
import {
  ExtractedMessage,
  getConfig,
  LinguiConfigNormalized,
} from "@lingui/conf"
import extract from "../api/extractors"

export type ExtractWorkerFunction = typeof extractWorker

let linguiConfig: LinguiConfigNormalized | undefined

const extractWorker = async (
  filename: string,
  linguiConfigPath: string
): Promise<{ messages?: ExtractedMessage[]; success: boolean }> => {
  if (!linguiConfig) {
    // initialize config once per worker, speed up workers follow execution
    linguiConfig = getConfig({
      configPath: linguiConfigPath,
      skipValidation: true,
    })
  }

  const messages: ExtractedMessage[] = []

  const success = await extract(
    filename,
    (msg: ExtractedMessage) => {
      messages.push(msg)
    },
    linguiConfig
  )

  return { success, messages }
}

expose(extractWorker)

import { expose } from "threads/worker"
import { ExtractedMessage, getConfig } from "@lingui/conf"
import extract from "../api/extractors"

export type ExtractWorkerFunction = typeof extractWorker

const extractWorker = async (
  filename: string,
  linguiConfigPath: string
): Promise<{ messages?: ExtractedMessage[]; success: boolean }> => {
  const linguiConfig = getConfig({
    configPath: linguiConfigPath,
    skipValidation: true,
  })

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

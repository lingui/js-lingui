import { ExtractedMessage, LinguiConfigNormalized } from "@lingui/conf"
import extract from "../api/extractors/index.js"

export async function extractFromChunk(
  filename: string,
  linguiConfig: LinguiConfigNormalized,
) {
  const messages: ExtractedMessage[] = []

  const success = await extract(
    filename,
    (msg: ExtractedMessage) => {
      messages.push(msg)
    },
    linguiConfig,
  )

  return { success, messages }
}

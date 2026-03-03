import {
  ExtractedCatalogType,
  ExtractedMessage,
  LinguiConfigNormalized,
} from "@lingui/conf"
import { FormatterWrapper } from "../api/formats/index.js"
import { mergeExtractedMessage } from "../api/catalog/extractFromFiles.js"
import { writeCatalogs, writeTemplate } from "./writeCatalogs.js"
import extract from "../api/extractors/index.js"

async function extractFromBundle(
  filename: string,
  linguiConfig: LinguiConfigNormalized,
) {
  const messages: ExtractedCatalogType = {}

  let success: boolean

  try {
    await extract(
      filename,
      (msg: ExtractedMessage) => {
        mergeExtractedMessage(msg, messages, linguiConfig)
      },
      linguiConfig,
    )

    success = true
  } catch (e) {
    console.error(`Cannot process file ${filename} ${(e as Error).message}`)
    console.error((e as Error).stack)
    success = false
  }

  return { success, messages }
}

export async function extractFromBundleAndWrite(params: {
  entryPoint: string
  bundleFile: string
  linguiConfig: LinguiConfigNormalized
  outputPattern: string
  format: FormatterWrapper
  template: boolean
  locales: string[]
  clean: boolean
  overwrite: boolean
}): Promise<{ success: false } | { success: true; stat: string }> {
  const {
    linguiConfig,
    entryPoint,
    format,
    outputPattern,
    locales,
    overwrite,
    clean,
    template,
  } = params

  const { messages, success } = await extractFromBundle(
    params.bundleFile,
    params.linguiConfig,
  )

  if (!success) {
    return { success: false }
  }

  let stat: string

  if (template) {
    stat = (
      await writeTemplate({
        linguiConfig,
        clean,
        format,
        messages,
        entryPoint,
        outputPattern,
      })
    ).statMessage
  } else {
    stat = (
      await writeCatalogs({
        locales,
        linguiConfig,
        clean,
        format,
        messages,
        entryPoint,
        overwrite,
        outputPattern,
      })
    ).statMessage
  }

  return { success: true, stat }
}

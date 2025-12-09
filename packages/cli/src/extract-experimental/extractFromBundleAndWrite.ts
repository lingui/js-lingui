import {
  ExtractedCatalogType,
  ExtractedMessage,
  LinguiConfigNormalized,
} from "@lingui/conf"
import { FormatterWrapper } from "../api/formats/index.js"
import { mergeExtractedMessage } from "../api/catalog/extractFromFiles.js"
import { writeCatalogs, writeTemplate } from "./writeCatalogs.js"
import fs from "fs/promises"
import {
  extractFromFileWithBabel,
  getBabelParserOptions,
} from "../api/extractors/babel.js"

async function extractFromBundle(
  filename: string,
  linguiConfig: LinguiConfigNormalized
) {
  const messages: ExtractedCatalogType = {}

  let success: boolean

  try {
    const file = await fs.readFile(filename)

    const parserOptions = linguiConfig.extractorParserOptions

    await extractFromFileWithBabel(
      filename,
      file.toString(),
      (msg: ExtractedMessage) => {
        mergeExtractedMessage(msg, messages, linguiConfig)
      },
      {
        linguiConfig,
      },
      {
        plugins: getBabelParserOptions(filename, parserOptions),
      },
      true
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
}) {
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
    params.linguiConfig
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

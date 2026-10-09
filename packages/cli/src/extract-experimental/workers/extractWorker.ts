import {
  ExtractedMessage,
  getConfig,
  LinguiConfigNormalized,
} from "@lingui/conf"
import { extractFromChunk } from "../extractFromChunk.js"
import { ExtractStats, writeEntry, WriteEntryParams } from "../writeCatalogs.js"
import { FormatterWrapper, getFormat } from "../../api/formats/index.js"

export type ExtractWorkerFunction = typeof extractWorker
export type WriteCatalogsWorkerFunction = typeof writeCatalogsWorker

let linguiConfig: LinguiConfigNormalized | undefined
let format: FormatterWrapper | undefined

const getLinguiConfig = (linguiConfigPath: string) => {
  if (!linguiConfig) {
    linguiConfig = getConfig({
      configPath: linguiConfigPath,
      skipValidation: true,
    })
  }

  return linguiConfig
}

const extractWorker = async (
  linguiConfigPath: string,
  bundleFile: string,
): Promise<{ success: boolean; messages: ExtractedMessage[] }> => {
  return await extractFromChunk(bundleFile, getLinguiConfig(linguiConfigPath))
}

const writeCatalogsWorker = async (
  linguiConfigPath: string,
  params: WriteEntryParams,
): Promise<ExtractStats> => {
  const config = getLinguiConfig(linguiConfigPath)

  if (!format) {
    // formatter is not transferable between threads, so it is created once per worker
    format = await getFormat(config.format, config.sourceLocale)
  }

  return await writeEntry(params, config, format)
}

export { extractWorker, writeCatalogsWorker }

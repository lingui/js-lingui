import { expose } from "threads/worker"
import { getConfig, LinguiConfigNormalized } from "@lingui/conf"
import { extractFromBundleAndWrite } from "../extractFromBundleAndWrite"
import { FormatterWrapper, getFormat } from "../../api/formats"

export type ExtractWorkerFunction = typeof extractWorker

let linguiConfig: LinguiConfigNormalized | undefined
let format: FormatterWrapper | undefined

const extractWorker = async (
  linguiConfigPath: string,
  entryPoint: string,
  bundleFile: string,
  outputPattern: string,
  template: boolean,
  locales: string[],
  clean: boolean,
  overwrite: boolean
): Promise<{ success: boolean; stat?: string }> => {
  if (!linguiConfig) {
    // initialize config once per worker, speed up workers follow execution
    linguiConfig = getConfig({
      configPath: linguiConfigPath,
      skipValidation: true,
    })
  }

  if (!format) {
    format = await getFormat(
      linguiConfig.format,
      linguiConfig.formatOptions,
      linguiConfig.sourceLocale
    )
  }

  return await extractFromBundleAndWrite({
    entryPoint,
    bundleFile,
    outputPattern,
    format,
    linguiConfig,
    locales,
    overwrite,
    clean,
    template,
  })
}

expose(extractWorker)

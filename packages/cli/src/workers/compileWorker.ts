import { expose } from "threads/worker"
import { compileLocale } from "../api/compile/compileLocale.js"
import { CliCompileOptions } from "../lingui-compile.js"
import { getConfig, LinguiConfigNormalized } from "@lingui/conf"
import { SerializedLogs, WorkerLogger } from "../api/workerLogger.js"
import { ProgramExit } from "../api/ProgramExit.js"
import { Catalog } from "../api/catalog.js"
import { getCatalogs } from "../api/catalog/getCatalogs.js"

let linguiConfig: LinguiConfigNormalized | undefined
let catalogs: Catalog[] | undefined

const compileWorker = {
  compileLocale: async (
    locale: string,
    options: CliCompileOptions,
    doMerge: boolean,
    linguiConfigPath: string
  ): Promise<{
    logs?: SerializedLogs
    error?: unknown
    exitProgram?: boolean
  }> => {
    if (!linguiConfig) {
      // initialize config once per worker, speed up workers follow execution
      linguiConfig = getConfig({
        configPath: linguiConfigPath,
        skipValidation: true,
      })
    }

    if (!catalogs) {
      // catalogs holds path to the files and message catalogs, so it's kinda configuration object
      // it depends only on the config, so we can initialize it once per program execution
      catalogs = await getCatalogs(linguiConfig)
    }

    const logger = new WorkerLogger()

    try {
      await compileLocale(
        catalogs,
        locale,
        options,
        linguiConfig,
        doMerge,
        logger
      )
    } catch (error) {
      return {
        logs: logger.flush(),
        error,
        exitProgram: error instanceof ProgramExit,
      }
    }

    return { logs: logger.flush() }
  },
}

export type CompileWorker = typeof compileWorker

expose(compileWorker)

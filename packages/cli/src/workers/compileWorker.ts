import { expose } from "threads/worker"
import { compileLocale } from "../api/compile/compileLocale"
import { CliCompileOptions } from "../lingui-compile"
import { getConfig } from "@lingui/conf"
import { SerializedLogs, WorkerLogger } from "../api/workerLogger"
import { ProgramExit } from "../api/ProgramExit"

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
    const linguiConfig = getConfig({
      configPath: linguiConfigPath,
      skipValidation: true,
    })

    const logger = new WorkerLogger()

    try {
      await compileLocale(locale, options, linguiConfig, doMerge, logger)
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

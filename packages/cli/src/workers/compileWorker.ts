import { expose } from "threads/worker"
import { type CompiledMessage } from "@lingui/message-utils/compileMessage"
import { compileLocale } from "../api/compile/compileLocale"
import { CliCompileOptions } from "../lingui-compile"
import { getConfig } from "@lingui/conf"

const compileWorker = {
  compileLocale: async (
    locale: string,
    options: CliCompileOptions,
    doMerge: boolean,
    linguiConfigPath: string
  ): Promise<{ result?: CompiledMessage; error?: Error }> => {
    const linguiConfig = getConfig({
      configPath: linguiConfigPath,
      skipValidation: true,
    })

    try {
      await compileLocale(locale, options, linguiConfig, doMerge)
    } catch (error) {
      return { error: error as Error }
    }
  },
}

export type CompileWorker = typeof compileWorker

expose(compileWorker)

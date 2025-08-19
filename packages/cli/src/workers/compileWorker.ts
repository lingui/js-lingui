import { expose } from "threads/worker"
import { compile } from "../api/compile"
import { type CompiledMessage } from "@lingui/message-utils/compileMessage"

export type CompileWorkerFunction = (
  message: string,
  shouldPseudolocalize: boolean
) => Promise<{ result?: CompiledMessage; error?: Error }>

const compileWorker: CompileWorkerFunction = async (
  message,
  shouldPseudolocalize
) => {
  try {
    const result = compile(message, shouldPseudolocalize)
    return { result }
  } catch (error) {
    return { error: error as Error }
  }
}

expose(compileWorker)

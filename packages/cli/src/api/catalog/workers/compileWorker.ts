import { Worker, isMainThread, parentPort, workerData } from "worker_threads"

// Register ts-node for worker threads if needed
if (!isMainThread) {
  try {
    require("ts-node/register")
  } catch {
    // ts-node not available, assuming compiled JS is being used
  }
}

import { createCompiledCatalog, CreateCompileCatalogOptions, MessageCompilationError } from "../../compile"

export type CompileWorkerData = {
  locale: string
  messages: Record<string, string>
  options: CreateCompileCatalogOptions
}

export type CompileWorkerResult = {
  success: boolean
  source?: string
  errors?: MessageCompilationError[]
  error?: string
}

async function compileMessages(
  locale: string,
  messages: Record<string, string>,
  options: CreateCompileCatalogOptions
): Promise<CompileWorkerResult> {
  try {
    const { source, errors } = createCompiledCatalog(locale, messages, options)
    
    return {
      success: true,
      source,
      errors
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

if (!isMainThread) {
  const { locale, messages, options } = workerData as CompileWorkerData

  compileMessages(locale, messages, options)
    .then((result) => {
      parentPort?.postMessage(result)
    })
    .catch((error) => {
      parentPort?.postMessage({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      })
    })
}

export async function compileWithWorker(
  locale: string,
  messages: Record<string, string>,
  options: CreateCompileCatalogOptions
): Promise<CompileWorkerResult> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, {
      workerData: {
        locale,
        messages,
        options
      } as CompileWorkerData
    })

    worker.on("message", (result: CompileWorkerResult) => {
      resolve(result)
    })

    worker.on("error", (error) => {
      reject(error)
    })

    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`))
      }
    })
  })
}
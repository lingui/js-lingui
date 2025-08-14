import { CreateCompileCatalogOptions, MessageCompilationError } from "../../compile"
import { TaskQueue } from "./taskQueue"
import { CompileWorkerResult } from "./compileWorker"
import { createCompiledCatalog } from "../../compile"
import path from "path"

export type MultiThreadCompileTask = {
  locale: string
  messages: Record<string, string>
  options: CreateCompileCatalogOptions
}

export type MultiThreadCompileResult = {
  locale: string
  success: boolean
  source?: string
  errors?: MessageCompilationError[]
  error?: string
}

export async function compileMessagesMultiThread(
  tasks: MultiThreadCompileTask[]
): Promise<MultiThreadCompileResult[]> {
  // Use the compiled JS file if available, otherwise use TS file
  const workerScript = path.join(__dirname, "compileWorker.js")
  const workerScriptFallback = path.join(__dirname, "compileWorker.ts")
  
  let finalWorkerScript: string
  try {
    require.resolve(workerScript)
    finalWorkerScript = workerScript
  } catch {
    finalWorkerScript = workerScriptFallback
  }

  const taskQueue = new TaskQueue<any, CompileWorkerResult>(
    true,
    finalWorkerScript
  )

  // Add compilation tasks
  for (const task of tasks) {
    taskQueue.addTask(task.locale, {
      locale: task.locale,
      messages: task.messages,
      options: task.options
    })
  }

  try {
    const results = await taskQueue.executeAll()
    
    return results.map((result, index) => ({
      locale: tasks[index].locale,
      success: result.success,
      source: result.source,
      errors: result.errors,
      error: result.error
    }))

  } catch (error) {
    console.error("Multi-threaded compilation failed:", error)
    return tasks.map(task => ({
      locale: task.locale,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }))
  }
}

export async function compileMessages(
  tasks: MultiThreadCompileTask[],
  useMultiThreading: boolean = false
): Promise<MultiThreadCompileResult[]> {
  if (useMultiThreading) {
    return compileMessagesMultiThread(tasks)
  } else {
    // Single-threaded fallback
    return tasks.map(task => {
      try {
        const { source, errors } = createCompiledCatalog(
          task.locale,
          task.messages,
          task.options
        )
        return {
          locale: task.locale,
          success: true,
          source,
          errors
        }
      } catch (error) {
        return {
          locale: task.locale,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        }
      }
    })
  }
}
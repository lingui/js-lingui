import { LinguiConfigNormalized, ExtractorType } from "@lingui/conf"
import { ExtractedCatalogType } from "../../types"
import { TaskQueue } from "./taskQueue"
import { ExtractWorkerResult } from "./extractWorker"
import { extractFromFiles as extractFromFilesSingleThread } from "../extractFromFiles"
import path from "path"

function mergeCatalogs(catalogs: ExtractedCatalogType[]): ExtractedCatalogType {
  const mergedMessages: ExtractedCatalogType = {}

  for (const catalog of catalogs) {
    for (const [id, message] of Object.entries(catalog)) {
      if (!mergedMessages[id]) {
        mergedMessages[id] = message
      } else {
        // Merge messages with the same id
        const existing = mergedMessages[id]
        mergedMessages[id] = {
          ...existing,
          message: existing.message ?? message.message,
          comments: [...existing.comments, ...message.comments].sort(),
          origin: [...existing.origin, ...message.origin].sort((a, b) => 
            a[0].localeCompare(b[0])
          ),
          placeholders: {
            ...existing.placeholders,
            ...message.placeholders
          }
        }
      }
    }
  }

  return mergedMessages
}

export async function extractFromFilesMultiThread(
  paths: string[],
  config: LinguiConfigNormalized
): Promise<ExtractedCatalogType | undefined> {
  const extractorOptions = {
    extractors: config.extractors as ExtractorType[]
  }

  // Use the compiled JS file if available, otherwise use TS file
  const workerScript = path.join(__dirname, "extractWorker.js")
  const workerScriptFallback = path.join(__dirname, "extractWorker.ts")
  
  let finalWorkerScript: string
  try {
    require.resolve(workerScript)
    finalWorkerScript = workerScript
  } catch {
    finalWorkerScript = workerScriptFallback
  }

  const taskQueue = new TaskQueue<any, ExtractWorkerResult>(
    true,
    finalWorkerScript
  )

  // Add tasks for each file
  for (const filePath of paths) {
    taskQueue.addTask(filePath, {
      filePath,
      config,
      extractorOptions
    })
  }

  try {
    const results = await taskQueue.executeAll()
    
    // Check if all extractions were successful
    const failedResults = results.filter(result => !result.success)
    if (failedResults.length > 0) {
      console.error(`Failed to extract from ${failedResults.length} files`)
      for (const failed of failedResults) {
        if (failed.error) {
          console.error(failed.error)
        }
      }
      return undefined
    }

    // Merge all successful results
    const catalogs = results
      .filter(result => result.success && result.messages)
      .map(result => result.messages!)

    return mergeCatalogs(catalogs)

  } catch (error) {
    console.error("Multi-threaded extraction failed:", error)
    return undefined
  }
}

export async function extractFromFiles(
  paths: string[],
  config: LinguiConfigNormalized,
  useMultiThreading: boolean = false
): Promise<ExtractedCatalogType | undefined> {
  if (useMultiThreading && config.experimental?.multiThreading) {
    return extractFromFilesMultiThread(paths, config)
  } else {
    return extractFromFilesSingleThread(paths, config)
  }
}
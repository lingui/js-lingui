import { Worker, isMainThread, parentPort, workerData } from "worker_threads"
import { LinguiConfigNormalized, ExtractedMessage, ExtractorType } from "@lingui/conf"

// Register ts-node for worker threads if needed
if (!isMainThread) {
  try {
    require("ts-node/register")
  } catch {
    // ts-node not available, assuming compiled JS is being used
  }
}

import extract from "../../extractors"
import { ExtractedCatalogType, MessageOrigin } from "../../types"
import { prettyOrigin } from "../../utils"
import path from "path"
import pico from "picocolors"

export type ExtractWorkerData = {
  filePath: string
  config: LinguiConfigNormalized
  extractorOptions: {
    extractors: ExtractorType[]
  }
}

export type ExtractWorkerResult = {
  success: boolean
  messages?: ExtractedCatalogType
  error?: string
}

function mergePlaceholders(
  prev: Record<string, string[]>,
  next: Record<string, string>
) {
  const res = { ...prev }

  Object.entries(next).forEach(([key, value]) => {
    if (!res[key]) {
      res[key] = []
    }

    if (!res[key].includes(value)) {
      res[key].push(value)
    }

    res[key].sort()
  })

  return res
}

async function processFile(
  filePath: string, 
  config: LinguiConfigNormalized,
  extractorOptions: { extractors: ExtractorType[] }
): Promise<ExtractWorkerResult> {
  const messages: ExtractedCatalogType = {}

  try {
    const fileSuccess = await extract(
      filePath,
      (next: ExtractedMessage) => {
        if (!messages[next.id]) {
          messages[next.id] = {
            message: next.message,
            context: next.context,
            placeholders: {},
            comments: [],
            origin: [],
          }
        }

        const prev = messages[next.id]

        const filename = next.origin[0]
          ? path.relative(config.rootDir, next.origin[0]).replace(/\\/g, "/")
          : ""

        const origin: MessageOrigin = [filename, next.origin[1]]

        if (prev.message && next.message && prev.message !== next.message) {
          throw new Error(
            `Encountered different default translations for message ${pico.yellow(
              next.id
            )}` +
              `\n${pico.yellow(prettyOrigin(prev.origin))} ${prev.message}` +
              `\n${pico.yellow(prettyOrigin([origin]))} ${next.message}`
          )
        }

        messages[next.id] = {
          ...prev,
          message: prev.message ?? next.message,
          comments: next.comment
            ? [...prev.comments, next.comment].sort()
            : prev.comments,
          origin: (
            [...prev.origin, [filename, next.origin[1]]] as MessageOrigin[]
          ).sort((a, b) => a[0].localeCompare(b[0])),
          placeholders: mergePlaceholders(
            prev.placeholders,
            next.placeholders
          ),
        }
      },
      config,
      extractorOptions
    )

    return {
      success: fileSuccess,
      messages: fileSuccess ? messages : undefined
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

if (!isMainThread) {
  const { filePath, config, extractorOptions } = workerData as ExtractWorkerData

  processFile(filePath, config, extractorOptions)
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

export async function extractFileWithWorker(
  filePath: string,
  config: LinguiConfigNormalized,
  extractorOptions: { extractors: ExtractorType[] }
): Promise<ExtractWorkerResult> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, {
      workerData: {
        filePath,
        config,
        extractorOptions
      } as ExtractWorkerData
    })

    worker.on("message", (result: ExtractWorkerResult) => {
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
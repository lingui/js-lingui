import type {
  ExtractedMessage,
  ExtractorType,
  LinguiConfigNormalized,
} from "@lingui/conf"
import pico from "picocolors"
import path from "path"
import extract from "../extractors"
import { ExtractedCatalogType, MessageOrigin } from "../types"
import { prettyOrigin } from "../utils"
import fs from "fs/promises"
import { Pool, spawn, Worker } from "threads"
import type { ExtractWorkerFunction } from "../../workers/extractWorker"
import babel from "../extractors/babel"

export const DEFAULT_EXTRACTORS: ExtractorType[] = [babel]

function isUsingDefaultExtractors(config: LinguiConfigNormalized): boolean {
  const extractors = config.extractors as ExtractorType[]
  
  if (!extractors || extractors.length === 0) return true
  
  if (extractors.length !== DEFAULT_EXTRACTORS.length) return false
  
  return extractors.every((extractor, index) => 
    extractor === DEFAULT_EXTRACTORS[index]
  )
}

function createSerializableConfig(config: LinguiConfigNormalized): Omit<LinguiConfigNormalized, 'extractors'> {
  const { extractors, ...serializableConfig } = config
  return serializableConfig
}

export { isUsingDefaultExtractors, createSerializableConfig }

function mergePlaceholders(
  prev: Record<string, string[]>,
  next: Record<string, string>
) {
  const res = { ...prev }

  // Handle case where next is null or undefined
  if (!next) return res

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

export async function extractFromFiles(
  paths: string[],
  config: LinguiConfigNormalized
) {
  const messages: ExtractedCatalogType = {}

  let catalogSuccess = true

  if (config.experimental?.multiThread) {
    if (!isUsingDefaultExtractors(config)) {
      throw new Error(
        "multiThread is only supported when using default extractors (babel). " +
        "Custom extractors cannot be passed to worker threads. " +
        "Please disable multiThread or remove custom extractors from your configuration."
      )
    }
    
    catalogSuccess = await extractFromFilesWithWorkers(paths, config, messages)
  } else {
    await Promise.all(
      paths.map(async (filename) => {
        const fileSuccess = await extract(
          filename,
          (next: ExtractedMessage) => {
            processExtractedMessage(next, messages, config)
          },
          config,
          {
            extractors: config.extractors as ExtractorType[],
          }
        )
        catalogSuccess &&= fileSuccess
      })
    )
  }

  if (!catalogSuccess) return undefined

  return messages
}

function processExtractedMessage(
  next: ExtractedMessage,
  messages: ExtractedCatalogType,
  config: LinguiConfigNormalized
) {
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

  // there might be a case when filename was not mapped from sourcemaps
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
}

type ExtractedFileResult = {
  success: boolean
  originalIndex: number
  filename: string
  messages: ExtractedMessage[]
}

async function extractFromFilesWithWorkers(
  paths: string[],
  config: LinguiConfigNormalized,
  messages: ExtractedCatalogType
): Promise<boolean> {
  const pool = Pool(
    () => spawn<ExtractWorkerFunction>(new Worker("../../workers/extractWorker"))
  )

  let catalogSuccess = true

  try {
    // Create a serializable version of config without extractors
    const serializableConfig = createSerializableConfig(config)

    // Read all files in parallel, maintaining original order
    const fileContents = await Promise.all(
      paths.map(async (filename, index) => {
        try {
          const content = await fs.readFile(filename, "utf8")
          return { filename, content, success: true, originalIndex: index }
        } catch (error) {
          console.error(`Cannot read file ${filename}: ${(error as Error).message}`)
          return { filename, content: "", success: false, originalIndex: index }
        }
      })
    )

    const results: ExtractedFileResult[] = await Promise.all(
      fileContents.map(({ filename, content, success, originalIndex }) => {
        if (!success) {
          catalogSuccess = false
          return Promise.resolve({ success: false, originalIndex, filename, messages: [] })
        }
        
        return pool.queue(async (worker) => {
          const result = await worker(
            filename,
            content,
            serializableConfig
          )

          if (result.error) {
            console.error(`Worker error for ${filename}: ${result.error.message}`)
            catalogSuccess = false
            return { success: false, originalIndex, filename, messages: [] }
          }

          return {
            success: true,
            originalIndex,
            filename,
            messages: result.messages || []
          }
        })
      })
    )

    results.sort((a, b) => a.originalIndex - b.originalIndex)

    results.forEach(({ success, messages: extractedMessages }) => {
      if (success && extractedMessages) {
        extractedMessages.forEach((message) => {
          processExtractedMessage(message, messages, config)
        })
      }
    })

    await pool.completed(true)
  } finally {
    await pool.terminate()
  }

  return catalogSuccess
}

export async function extractFromFilesExperimental(
  paths: string[],
  config: LinguiConfigNormalized
): Promise<ExtractedCatalogType | undefined> {
  const useMultiThread = config.experimental?.multiThread === true
  
  if (!useMultiThread) {
    const { experimentalExtractor } = await import("../extractors/babel")
    const experimentalConfig = {
      ...config,
      extractors: [experimentalExtractor],
    }
    return extractFromFiles(paths, experimentalConfig)
  }

  const { Pool, spawn, Worker } = await import("threads")
  const pool = Pool(
    () => spawn(new Worker("../../workers/extractExperimentalWorker"))
  )

  let catalogSuccess = true
  const messages: ExtractedCatalogType = {}

  try {
    const serializableConfig = createSerializableConfig(config)

    const fileContents = await Promise.all(
      paths.map(async (filename, originalIndex) => {
        try {
          const content = await fs.readFile(filename, "utf8")
          return { filename, content, originalIndex, success: true }
        } catch (error) {
          console.error(`Failed to read file ${filename}: ${(error as Error).message}`)
          return { filename, content: "", originalIndex, success: false }
        }
      })
    )

    const results: ExtractedFileResult[] = await Promise.all(
      fileContents.map(async ({ filename, content, originalIndex, success }) => {
        if (!success) {
          return { success: false, originalIndex, filename, messages: [] }
        }

        const result = await pool.queue(async (extractExperimentalWorker) => {
          return extractExperimentalWorker(filename, content, serializableConfig)
        })

        if (result.error) {
          console.error(`Worker error for ${filename}: ${result.error.message}`)
          catalogSuccess = false
          return { success: false, originalIndex, filename, messages: [] }
        }

        return { 
          success: true, 
          originalIndex, 
          filename, 
          messages: result.messages || [] 
        }
      })
    )

    results.sort((a, b) => a.originalIndex - b.originalIndex)

    results.forEach(({ success, messages: extractedMessages }) => {
      if (success && extractedMessages) {
        extractedMessages.forEach((message) => {
          processExtractedMessage(message, messages, config)
        })
      }
    })

    await pool.completed(true)
    await pool.terminate()

    if (!catalogSuccess) return undefined
    return messages
  } catch (error) {
    await pool.terminate()
    throw error
  }
}

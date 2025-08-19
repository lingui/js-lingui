import type { ExtractedMessage, LinguiConfigNormalized } from "@lingui/conf"
import pico from "picocolors"
import path from "path"
import extract from "../extractors"
import { ExtractedCatalogType, MessageOrigin } from "../types"
import { prettyOrigin } from "../utils"
import { Pool, spawn, Worker } from "threads"
import type { ExtractWorkerFunction } from "../../workers/extractWorker"

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
    catalogSuccess = await extractFromFilesWithWorkers(paths, config, messages)
  } else {
    await Promise.all(
      paths.map(async (filename) => {
        const fileSuccess = await extract(
          filename,
          (next: ExtractedMessage) => {
            processExtractedMessage(next, messages, config)
          },
          config
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
    placeholders: mergePlaceholders(prev.placeholders, next.placeholders),
  }
}

async function extractFromFilesWithWorkers(
  paths: string[],
  config: LinguiConfigNormalized,
  messages: ExtractedCatalogType
): Promise<boolean> {
  const pool = Pool(() =>
    spawn<ExtractWorkerFunction>(new Worker("../../workers/extractWorker"))
  )

  let catalogSuccess = true

  try {
    if (!config.resolvedConfigPath) {
      throw new Error(
        "Multithreading is only supported when lingui config loaded from file system, not passed by API"
      )
    }

    await Promise.all(
      paths.map((filename) => {
        return pool.queue(async (worker) => {
          const result = await worker(filename, config.resolvedConfigPath)

          if (!result.success) {
            catalogSuccess = false
          } else {
            result.messages.forEach((message) => {
              processExtractedMessage(message, messages, config)
            })
          }
        })
      })
    )

    await pool.completed(true)
  } finally {
    await pool.terminate()
  }

  return catalogSuccess
}
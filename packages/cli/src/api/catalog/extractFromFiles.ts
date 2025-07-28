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
  })

  return res
}

export async function extractFromFiles(
  paths: string[],
  config: LinguiConfigNormalized
) {
  const messages: ExtractedCatalogType = {}

  let catalogSuccess = true

  await Promise.all(
    paths.map(async (filename) => {
      const fileSuccess = await extract(
        filename,
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
              ? [...prev.comments, next.comment]
              : prev.comments,
            origin: [...prev.origin, [filename, next.origin[1]]],
            placeholders: mergePlaceholders(
              prev.placeholders,
              next.placeholders
            ),
          }
        },
        config,
        {
          extractors: config.extractors as ExtractorType[],
        }
      )
      catalogSuccess &&= fileSuccess
    })
  )

  if (!catalogSuccess) return undefined

  return messages
}

import type {
  ExtractedMessage,
  ExtractorType,
  LinguiConfigNormalized,
} from "@lingui/conf"
import extract from "../extractors"
import path from "path"
import chalk from "chalk"
import { prettyOrigin } from "../utils"
import { MessageOrigin, ExtractedCatalogType } from "../types"

export async function extractFromFiles(
  paths: string[],
  config: LinguiConfigNormalized
) {
  const messages: ExtractedCatalogType = {}

  let catalogSuccess = true
  for (let filename of paths) {
    const fileSuccess = await extract(
      filename,
      (next: ExtractedMessage) => {
        if (!messages[next.id]) {
          messages[next.id] = {
            message: next.message,
            context: next.context,
            extractedComments: [],
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
            `Encountered different default translations for message ${chalk.yellow(
              next.id
            )}` +
              `\n${chalk.yellow(prettyOrigin(prev.origin))} ${prev.message}` +
              `\n${chalk.yellow(prettyOrigin([origin]))} ${next.message}`
          )
        }

        messages[next.id] = {
          ...prev,
          extractedComments: next.comment
            ? [...prev.extractedComments, next.comment]
            : prev.extractedComments,
          origin: [...prev.origin, [filename, next.origin[1]]],
        }
      },
      config,
      {
        extractors: config.extractors as ExtractorType[],
      }
    )
    catalogSuccess &&= fileSuccess
  }

  if (!catalogSuccess) return undefined

  return messages
}

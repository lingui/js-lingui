import fs from "fs"
import { dirname } from "path"
import { globSync } from "glob"
import { CatalogType, LinguiConfigNormalized, MessageType } from "@lingui/conf"
import { CliExtractOptions } from "../lingui-extract"
import {
  tioInit,
  tioSync,
  TranslationIoProject,
  TranslationIoSegment,
} from "./translationIO/api-client"
import { FormatterWrapper, getFormat } from "../api/formats"
import { generateMessageId } from "@lingui/message-utils/generateMessageId"
import { order } from "../api/catalog"

const EXPLICIT_ID_FLAG = "js-lingui-explicit-id"
const EXPLICIT_ID_AND_CONTEXT_FLAG = "js-lingui-explicit-id-and-context"

const getTargetLocales = (config: LinguiConfigNormalized) => {
  const sourceLocale = config.sourceLocale || "en"
  const pseudoLocale = config.pseudoLocale || "pseudo"
  return config.locales.filter(
    (value) => value != sourceLocale && value != pseudoLocale
  )
}

// Main sync method, call "Init" or "Sync" depending on the project context
export default async function syncProcess(
  config: LinguiConfigNormalized,
  options: CliExtractOptions
) {
  const reportSuccess = (project: TranslationIoProject) => {
    return `\n----------\nProject successfully synchronized. Please use this URL to translate: ${project.url}\n----------`
  }

  const reportError = (errors: string[]) => {
    throw `\n----------\nSynchronization with Translation.io failed: ${errors.join(
      ", "
    )}\n----------`
  }

  const format = await getFormat(
    config.format,
    config.formatOptions,
    config.sourceLocale
  )

  const { success, project, errors } = await init(config, format)

  if (success) {
    return reportSuccess(project)
  }

  if (errors[0] === "This project has already been initialized.") {
    const { success, project, errors } = await sync(config, options, format)

    if (success) {
      return reportSuccess(project)
    }

    return reportError(errors)
  }

  return reportError(errors)
}

// Initialize project with source and existing translations (only first time!)
// Cf. https://translation.io/docs/create-library#initialization
export async function init(
  config: LinguiConfigNormalized,
  format: FormatterWrapper
) {
  const sourceLocale = config.sourceLocale || "en"
  const targetLocales = getTargetLocales(config)
  const paths = poPathsPerLocale(config)

  const segments: { [locale: string]: TranslationIoSegment[] } = {}

  targetLocales.forEach((targetLocale) => {
    segments[targetLocale] = []
  })

  // Create segments from source locale PO items
  for (const path of paths[sourceLocale]) {
    const catalog = await format.read(path, sourceLocale)

    Object.entries(catalog).forEach(([key, entry]) => {
      if (entry.obsolete) return

      targetLocales.forEach((targetLocale) => {
        segments[targetLocale].push(createSegmentFromLinguiItem(key, entry))
      })
    })
  }

  // Add translations to segments from target locale PO items
  for (const targetLocale of targetLocales) {
    for (const path of paths[targetLocale]) {
      const catalog = await format.read(path, targetLocale)

      Object.entries(catalog)
        .filter(([, entry]) => !entry.obsolete)
        .forEach(([, entry], index) => {
          segments[targetLocale][index].target = entry.translation
        })
    }
  }

  const { data, error } = await tioInit(
    {
      client: "lingui",
      version: require("@lingui/core/package.json").version,
      source_language: sourceLocale,
      target_languages: targetLocales,
      segments: segments,
    },
    config.service!.apiKey
  )

  if (error) {
    return { success: false, errors: [error.message] as string[] } as const
  }

  if (data.errors) {
    return { success: false, errors: data.errors } as const
  }

  await saveSegmentsToTargetPos(config, paths, data.segments, format)
  return { success: true, project: data.project } as const
}

// Send all source text from PO to Translation.io and create new PO based on received translations
// Cf. https://translation.io/docs/create-library#synchronization
export async function sync(
  config: LinguiConfigNormalized,
  options: CliExtractOptions,
  format: FormatterWrapper
) {
  const sourceLocale = config.sourceLocale || "en"
  const targetLocales = getTargetLocales(config)
  const paths = poPathsPerLocale(config)

  const segments: TranslationIoSegment[] = []

  // Create segments with correct source
  for (const path of paths[sourceLocale]) {
    const catalog = await format.read(path, sourceLocale) // todo

    Object.entries(catalog).forEach(([key, entry]) => {
      if (entry.obsolete) return

      segments.push(createSegmentFromLinguiItem(key, entry))
    })
  }

  const { data, error } = await tioSync(
    {
      client: "lingui",
      version: require("@lingui/core/package.json").version,
      source_language: sourceLocale,
      target_languages: targetLocales,
      segments: segments,

      // Sync and then remove unused segments (not present in the local application) from Translation.io
      purge: Boolean(options.clean),
    },
    config.service!.apiKey
  )

  if (error) {
    return { success: false, errors: [error.message] as string[] } as const
  }

  if (data.errors) {
    return { success: false, errors: data.errors } as const
  }

  await saveSegmentsToTargetPos(config, paths, data.segments, format)
  return { success: true, project: data.project } as const
}

function isGeneratedId(id: string, message: MessageType): boolean {
  return id === generateMessageId(message.message, message.context)
}

const joinOrigin = (origin: [file: string, line?: number]): string =>
  origin.join(":")

const splitOrigin = (origin: string) => {
  const [file, line] = origin.split(":")
  return [file, line ? Number(line) : null] as [file: string, line: number]
}

export function createSegmentFromLinguiItem(key: string, item: MessageType) {
  const itemHasExplicitId = !isGeneratedId(key, item)
  const itemHasContext = !!item.context

  const segment: TranslationIoSegment = {
    type: "source", // No way to edit text for source language (inside code), so not using "key" here
    source: "",
    context: "",
    references: [],
    comment: "",
  }

  // For segment.source & segment.context, we must remain compatible with projects created/synced before Lingui V4
  if (itemHasExplicitId) {
    segment.source = item.message || item.translation
    segment.context = key
  } else {
    segment.source = item.message || item.translation

    if (itemHasContext) {
      segment.context = item.context
    }
  }

  if (item.origin) {
    segment.references = item.origin.map(joinOrigin)
  }

  // Since Lingui v4, when using explicit IDs, Lingui automatically adds 'js-lingui-explicit-id' to the extractedComments array
  if (item.comments?.length) {
    segment.comment = item.comments.join(" | ")

    if (itemHasExplicitId && itemHasContext) {
      // segment.context is already used for the explicit ID, so we need to pass the context (for translators) in segment.comment
      segment.comment = `${item.context} | ${segment.comment}`

      // Replace the flag to let us know how to recompose a target PO Item that is consistent with the source PO Item
      segment.comment = segment.comment.replace(
        EXPLICIT_ID_FLAG,
        EXPLICIT_ID_AND_CONTEXT_FLAG
      )
    }
  }

  return segment
}

export function createLinguiItemFromSegment(segment: TranslationIoSegment) {
  const segmentHasExplicitId = segment.comment?.includes(EXPLICIT_ID_FLAG)
  const segmentHasExplicitIdAndContext = segment.comment?.includes(
    EXPLICIT_ID_AND_CONTEXT_FLAG
  )

  const item: MessageType = {
    translation: segment.target!,
    origin: segment.references?.length
      ? segment.references.map(splitOrigin)
      : [],
    message: segment.source,
    comments: [],
  }

  let id: string = null

  if (segmentHasExplicitId || segmentHasExplicitIdAndContext) {
    id = segment.context!
  } else {
    id = generateMessageId(segment.source, segment.context)
    item.context = segment.context
  }

  if (segment.comment) {
    segment.comment = segment.comment.replace(
      EXPLICIT_ID_AND_CONTEXT_FLAG,
      EXPLICIT_ID_FLAG
    )

    item.comments = segment.comment ? segment.comment.split(" | ") : []

    // We recompose a target PO Item that is consistent with the source PO Item
    if (segmentHasExplicitIdAndContext) {
      item.context = item.comments.shift()
    }
  }

  return [id, item] as const
}

export async function saveSegmentsToTargetPos(
  config: LinguiConfigNormalized,
  paths: { [locale: string]: string[] },
  segmentsPerLocale: { [locale: string]: TranslationIoSegment[] },
  format: FormatterWrapper
) {
  for (const targetLocale of Object.keys(segmentsPerLocale)) {
    // Remove existing target POs and JS for this target locale

    for (const path of paths[targetLocale]) {
      const jsPath = path.replace(/\.po?$/, "") + ".js"
      const dirPath = dirname(path)

      // Remove PO, JS and empty dir
      if (fs.existsSync(path)) {
        await fs.promises.unlink(path)
      }
      if (fs.existsSync(jsPath)) {
        await fs.promises.unlink(jsPath)
      }
      if (fs.existsSync(dirPath) && fs.readdirSync(dirPath).length === 0) {
        await fs.promises.rmdir(dirPath)
      }
    }

    // Find target path (ignoring {name})
    const localePath =
      config
        .catalogs![0].path.replace(/{locale}/g, targetLocale)
        .replace(/{name}/g, "") + ".po"

    const segments = segmentsPerLocale[targetLocale]

    const catalog: CatalogType = Object.fromEntries(
      segments.map((segment: TranslationIoSegment) =>
        createLinguiItemFromSegment(segment)
      )
    )

    await format.write(localePath, order(config.orderBy, catalog), targetLocale)
  }
}

export function poPathsPerLocale(config: LinguiConfigNormalized) {
  const paths: { [locale: string]: string[] } = {}

  config.locales.forEach((locale) => {
    paths[locale] = []

    config.catalogs!.forEach((catalog) => {
      const path = "".concat(
        catalog.path.replace(/{locale}/g, locale).replace(/{name}/g, "*"),
        ".po"
      )

      // If {name} is present (replaced by *), list all the existing POs
      if (path.includes("*")) {
        paths[locale] = paths[locale].concat(globSync(path))
      } else {
        paths[locale].push(path)
      }
    })
  })

  return paths
}

import fs from "fs"
import { dirname } from "path"

import { CatalogType, LinguiConfigNormalized } from "@lingui/conf"
import { CliExtractOptions } from "../lingui-extract.js"
import {
  tioInit,
  tioSync,
  TranslationIoProject,
  TranslationIoSegment,
} from "./translationIO/translationio-api.js"
import { Catalog } from "../api/catalog.js"
import { order } from "../api/catalog.js"
import {
  createLinguiItemFromSegment,
  createSegmentFromLinguiItem,
} from "./translationIO/segment-converters.js"
import { AllCatalogsType } from "../api/types.js"

const getTargetLocales = (config: LinguiConfigNormalized) => {
  const sourceLocale = config.sourceLocale || "en"
  const pseudoLocale = config.pseudoLocale || "pseudo"
  return config.locales.filter(
    (value) => value != sourceLocale && value != pseudoLocale
  )
}

type ExtractionResult = {
  catalog: Catalog
  messagesByLocale: AllCatalogsType
}[]

// Main sync method, call "Init" or "Sync" depending on the project context
export default async function syncProcess(
  config: LinguiConfigNormalized,
  options: CliExtractOptions,
  extractionResult: ExtractionResult
) {
  const reportSuccess = (project: TranslationIoProject) => {
    return `\n----------\nProject successfully synchronized. Please use this URL to translate: ${project.url}\n----------`
  }

  const reportError = (errors: string[]) => {
    throw `\n----------\nSynchronization with Translation.io failed: ${errors.join(
      ", "
    )}\n----------`
  }

  const { success, project, errors } = await init(config, extractionResult)

  if (success) {
    return reportSuccess(project)
  }

  if (errors[0] === "This project has already been initialized.") {
    const { success, project, errors } = await sync(
      config,
      options,
      extractionResult
    )

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
  extractionResult: ExtractionResult
) {
  const sourceLocale = config.sourceLocale || "en"
  const targetLocales = getTargetLocales(config)

  const segments: { [locale: string]: TranslationIoSegment[] } = {}

  targetLocales.forEach((targetLocale) => {
    segments[targetLocale] = []
  })

  // Create segments from source locale PO items
  for (const { messagesByLocale } of extractionResult) {
    const messages = messagesByLocale[sourceLocale]

    Object.entries(messages).forEach(([key, entry]) => {
      if (entry.obsolete) return

      targetLocales.forEach((targetLocale) => {
        segments[targetLocale].push(createSegmentFromLinguiItem(key, entry))
      })
    })
  }

  // Add translations to segments from target locale PO items
  for (const { messagesByLocale } of extractionResult) {
    for (const targetLocale of targetLocales) {
      const messages = messagesByLocale[targetLocale]

      Object.entries(messages)
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

  if ("errors" in data) {
    return { success: false, errors: data.errors } as const
  }

  await writeSegmentsToCatalogs(
    config,
    sourceLocale,
    extractionResult,
    data.segments
  )
  return { success: true, project: data.project } as const
}

// Send all source text from PO to Translation.io and create new PO based on received translations
// Cf. https://translation.io/docs/create-library#synchronization
export async function sync(
  config: LinguiConfigNormalized,
  options: CliExtractOptions,
  extractionResult: ExtractionResult
) {
  const sourceLocale = config.sourceLocale || "en"
  const targetLocales = getTargetLocales(config)

  const segments: TranslationIoSegment[] = []

  // Create segments with correct source
  for (const { messagesByLocale } of extractionResult) {
    const messages = messagesByLocale[sourceLocale]

    Object.entries(messages).forEach(([key, entry]) => {
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

  if ("errors" in data) {
    return { success: false, errors: data.errors } as const
  }

  await writeSegmentsToCatalogs(
    config,
    sourceLocale,
    extractionResult,
    data.segments
  )
  return { success: true, project: data.project } as const
}

export async function writeSegmentsToCatalogs(
  config: LinguiConfigNormalized,
  sourceLocale: string,
  extractionResult: ExtractionResult,
  segmentsPerLocale: { [locale: string]: TranslationIoSegment[] }
) {
  // Create segments from source locale PO items
  for (const { catalog, messagesByLocale } of extractionResult) {
    const sourceMessages = messagesByLocale[sourceLocale]

    for (const targetLocale of Object.keys(segmentsPerLocale)) {
      // Remove existing target POs and JS for this target locale

      {
        const path = catalog.getFilename(targetLocale)

        const jsPath =
          path.replace(
            new RegExp(`${catalog.format.getCatalogExtension()}$`),
            ""
          ) + ".js"

        const dirPath = dirname(path)

        // todo: check tests and all these logic, maybe it could be simplified to just drop the folder
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

      const translations = Object.fromEntries(
        segmentsPerLocale[targetLocale].map((segment) =>
          createLinguiItemFromSegment(segment)
        )
      )

      const messages: CatalogType = Object.fromEntries(
        Object.entries(sourceMessages).map(([key, entry]) => {
          return [
            key,
            {
              ...entry,
              translation: translations[key]?.translation,
            },
          ]
        })
      )

      await catalog.write(targetLocale, order(config.orderBy, messages))
    }
  }
}

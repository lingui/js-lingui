import fs from "fs"
import { dirname } from "path"

import { CatalogType, LinguiConfigNormalized } from "@lingui/conf"
import { CliExtractOptions } from "../lingui-extract"
import {
  tioInit,
  tioSync,
  TranslationIoProject,
  TranslationIoSegment,
} from "./translationIO/translationio-api"
import { Catalog } from "../api/catalog"
import { order } from "../api/catalog"
import {
  createLinguiItemFromSegment,
  createSegmentFromLinguiItem,
} from "./translationIO/segment-converters"
import { getCatalogs } from "../api/catalog/getCatalogs"

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

  const catalogs = await getCatalogs(config)

  const { success, project, errors } = await init(config, catalogs)

  if (success) {
    return reportSuccess(project)
  }

  if (errors[0] === "This project has already been initialized.") {
    const { success, project, errors } = await sync(config, options, catalogs)

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
  catalogs: Catalog[]
) {
  const sourceLocale = config.sourceLocale || "en"
  const targetLocales = getTargetLocales(config)

  const segments: { [locale: string]: TranslationIoSegment[] } = {}

  targetLocales.forEach((targetLocale) => {
    segments[targetLocale] = []
  })

  // Create segments from source locale PO items
  for (const catalog of catalogs) {
    const messages = await catalog.read(sourceLocale)

    Object.entries(messages).forEach(([key, entry]) => {
      if (entry.obsolete) return

      targetLocales.forEach((targetLocale) => {
        segments[targetLocale].push(createSegmentFromLinguiItem(key, entry))
      })
    })
  }

  // Add translations to segments from target locale PO items
  for (const targetLocale of targetLocales) {
    for (const catalog of catalogs) {
      const messages = await catalog.read(targetLocale)

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

  if (data.errors) {
    return { success: false, errors: data.errors } as const
  }

  await writeSegmentsToCatalogs(config, catalogs, data.segments)
  return { success: true, project: data.project } as const
}

// Send all source text from PO to Translation.io and create new PO based on received translations
// Cf. https://translation.io/docs/create-library#synchronization
export async function sync(
  config: LinguiConfigNormalized,
  options: CliExtractOptions,
  catalogs: Catalog[]
) {
  const sourceLocale = config.sourceLocale || "en"
  const targetLocales = getTargetLocales(config)

  const segments: TranslationIoSegment[] = []

  // Create segments with correct source
  for (const catalog of catalogs) {
    const messages = await catalog.read(sourceLocale)

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

  if (data.errors) {
    return { success: false, errors: data.errors } as const
  }

  await writeSegmentsToCatalogs(config, catalogs, data.segments)
  return { success: true, project: data.project } as const
}

export async function writeSegmentsToCatalogs(
  config: LinguiConfigNormalized,
  catalogs: Catalog[],
  segmentsPerLocale: { [locale: string]: TranslationIoSegment[] }
) {
  for (const targetLocale of Object.keys(segmentsPerLocale)) {
    const catalog = catalogs[0]
    // Remove existing target POs and JS for this target locale

    const path = catalog.getFilename(targetLocale)

    const jsPath =
      path.replace(new RegExp(`${catalog.format.getCatalogExtension()}$`), "") +
      ".js"

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

    const segments = segmentsPerLocale[targetLocale]

    const messages: CatalogType = Object.fromEntries(
      segments.map((segment: TranslationIoSegment) =>
        createLinguiItemFromSegment(segment)
      )
    )

    await catalog.write(targetLocale, order(config.orderBy, messages))
  }
}

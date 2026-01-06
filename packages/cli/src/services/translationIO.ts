import fs from "fs"
import { dirname } from "path"
import { globSync } from "glob"
import { CatalogType, LinguiConfigNormalized } from "@lingui/conf"
import { CliExtractOptions } from "../lingui-extract"
import {
  tioInit,
  tioSync,
  TranslationIoProject,
  TranslationIoSegment,
} from "./translationIO/api-client"
import { FormatterWrapper, getFormat } from "../api/formats"
import { order } from "../api/catalog"
import {
  createSegmentFromLinguiItem,
  createLinguiItemFromSegment,
} from "./translationIO/segment-converters"

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
  const paths = catalogPathsPerLocale(config)

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

  await writeSegmentsToCatalogs(config, paths, data.segments, format)
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
  const paths = catalogPathsPerLocale(config)

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

  await writeSegmentsToCatalogs(config, paths, data.segments, format)
  return { success: true, project: data.project } as const
}

export async function writeSegmentsToCatalogs(
  config: LinguiConfigNormalized,
  paths: { [locale: string]: string[] },
  segmentsPerLocale: { [locale: string]: TranslationIoSegment[] },
  format: FormatterWrapper
) {
  for (const targetLocale of Object.keys(segmentsPerLocale)) {
    // Remove existing target POs and JS for this target locale

    for (const path of paths[targetLocale]) {
      // todo: format.getCatalogExtension() instead of hardcoded .po
      const jsPath = path.replace(/\.po?$/, "") + ".js"
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

export function catalogPathsPerLocale(config: LinguiConfigNormalized) {
  const paths: { [locale: string]: string[] } = {}

  config.locales.forEach((locale) => {
    paths[locale] = []

    // todo: .po is hardcoded here
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

import fs from "fs"
import { dirname } from "path"
import PO from "pofile"
import { globSync } from "glob"
import { format as formatDate } from "date-fns"
import { LinguiConfigNormalized } from "@lingui/conf"
import { CliExtractOptions } from "../lingui-extract"
import {
  tioInit,
  tioSync,
  TranslationIoProject,
  TranslationIoSegment,
} from "./translationIO/api-client"
import { writeFile } from "../api/utils"

type POItem = InstanceType<typeof PO.Item>

const EXPLICIT_ID_FLAG = "js-lingui-explicit-id"
const EXPLICIT_ID_AND_CONTEXT_FLAG = "js-lingui-explicit-id-and-context"

const getCreateHeaders = (language: string) => ({
  "POT-Creation-Date": formatDate(new Date(), "yyyy-MM-dd HH:mmxxxx"),
  "MIME-Version": "1.0",
  "Content-Type": "text/plain; charset=utf-8",
  "Content-Transfer-Encoding": "8bit",
  "X-Generator": "@lingui/cli",
  Language: language,
})

const getTargetLocales = (config: LinguiConfigNormalized) => {
  const sourceLocale = config.sourceLocale || "en"
  const pseudoLocale = config.pseudoLocale || "pseudo"
  return config.locales.filter(
    (value) => value != sourceLocale && value != pseudoLocale
  )
}

const validCatalogFormat = (config: LinguiConfigNormalized): boolean => {
  if (typeof config.format === "string") {
    return config.format === "po"
  }
  return config.format!.catalogExtension === ".po"
}

// Main sync method, call "Init" or "Sync" depending on the project context
export default async function syncProcess(
  config: LinguiConfigNormalized,
  options: CliExtractOptions
) {
  if (!validCatalogFormat(config)) {
    throw `\n----------\nTranslation.io service is only compatible with the "po" format. Please update your Lingui configuration accordingly.\n----------`
  }

  const reportSuccess = (project: TranslationIoProject) => {
    return `\n----------\nProject successfully synchronized. Please use this URL to translate: ${project.url}\n----------`
  }

  const reportError = (errors: string[]) => {
    throw `\n----------\nSynchronization with Translation.io failed: ${errors.join(
      ", "
    )}\n----------`
  }

  const { success, project, errors } = await init(config, options)

  if (success) {
    return reportSuccess(project)
  }

  if (errors[0] === "This project has already been initialized.") {
    const { success, project, errors } = await sync(config, options)

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
  options: CliExtractOptions
) {
  const sourceLocale = config.sourceLocale || "en"
  const targetLocales = getTargetLocales(config)
  const paths = poPathsPerLocale(config)

  const segments: { [locale: string]: TranslationIoSegment[] } = {}

  targetLocales.forEach((targetLocale) => {
    segments[targetLocale] = []
  })

  // Create segments from source locale PO items
  paths[sourceLocale].forEach((path) => {
    const raw = fs.readFileSync(path).toString()
    const po = PO.parse(raw)

    po.items
      .filter((item) => !item["obsolete"])
      .forEach((item) => {
        targetLocales.forEach((targetLocale) => {
          const newSegment = createSegmentFromPoItem(item)

          segments[targetLocale].push(newSegment)
        })
      })
  })

  // Add translations to segments from target locale PO items
  targetLocales.forEach((targetLocale) => {
    paths[targetLocale].forEach((path) => {
      const raw = fs.readFileSync(path).toString()
      const po = PO.parse(raw)

      po.items
        .filter((item) => !item["obsolete"])
        .forEach((item, index) => {
          segments[targetLocale][index].target = item.msgstr[0]
        })
    })
  })

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

  await saveSegmentsToTargetPos(config, paths, data.segments)
  return { success: true, project: data.project } as const
}

// Send all source text from PO to Translation.io and create new PO based on received translations
// Cf. https://translation.io/docs/create-library#synchronization
export async function sync(
  config: LinguiConfigNormalized,
  options: CliExtractOptions
) {
  const sourceLocale = config.sourceLocale || "en"
  const targetLocales = getTargetLocales(config)
  const paths = poPathsPerLocale(config)

  const segments: TranslationIoSegment[] = []

  // Create segments with correct source
  paths[sourceLocale].forEach((path) => {
    const raw = fs.readFileSync(path).toString()
    const po = PO.parse(raw)

    po.items
      .filter((item) => !item["obsolete"])
      .forEach((item) => {
        const newSegment = createSegmentFromPoItem(item)

        segments.push(newSegment)
      })
  })

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

  await saveSegmentsToTargetPos(config, paths, data.segments)
  return { success: true, project: data.project } as const
}

export function createSegmentFromPoItem(item: POItem) {
  const itemHasExplicitId = item.extractedComments.includes(EXPLICIT_ID_FLAG)
  const itemHasContext = item.msgctxt != null

  const segment: TranslationIoSegment = {
    type: "source", // No way to edit text for source language (inside code), so not using "key" here
    source: "",
    context: "",
    references: [],
    comment: "",
  }

  // For segment.source & segment.context, we must remain compatible with projects created/synced before Lingui V4
  if (itemHasExplicitId) {
    segment.source = item.msgstr[0]
    segment.context = item.msgid
  } else {
    segment.source = item.msgid

    if (itemHasContext) {
      segment.context = item.msgctxt
    }
  }

  if (item.references.length) {
    segment.references = item.references
  }

  // Since Lingui v4, when using explicit IDs, Lingui automatically adds 'js-lingui-explicit-id' to the extractedComments array
  if (item.extractedComments.length) {
    segment.comment = item.extractedComments.join(" | ")

    if (itemHasExplicitId && itemHasContext) {
      // segment.context is already used for the explicit ID, so we need to pass the context (for translators) in segment.comment
      segment.comment = `${item.msgctxt} | ${segment.comment}`

      // Replace the flag to let us know how to recompose a target PO Item that is consistent with the source PO Item
      segment.comment = segment.comment.replace(
        EXPLICIT_ID_FLAG,
        EXPLICIT_ID_AND_CONTEXT_FLAG
      )
    }
  }

  return segment
}

export function createPoItemFromSegment(segment: TranslationIoSegment) {
  const segmentHasExplicitId = segment.comment?.includes(EXPLICIT_ID_FLAG)
  const segmentHasExplicitIdAndContext = segment.comment?.includes(
    EXPLICIT_ID_AND_CONTEXT_FLAG
  )

  const item = new PO.Item()

  if (segmentHasExplicitId || segmentHasExplicitIdAndContext) {
    item.msgid = segment.context!
  } else {
    item.msgid = segment.source
    item.msgctxt = segment.context
  }

  item.msgstr = [segment.target!]
  item.references =
    segment.references && segment.references.length ? segment.references : []

  if (segment.comment) {
    segment.comment = segment.comment.replace(
      EXPLICIT_ID_AND_CONTEXT_FLAG,
      EXPLICIT_ID_FLAG
    )
    item.extractedComments = segment.comment ? segment.comment.split(" | ") : []

    // We recompose a target PO Item that is consistent with the source PO Item
    if (segmentHasExplicitIdAndContext) {
      item.msgctxt = item.extractedComments.shift()
    }
  }

  return item
}

export async function saveSegmentsToTargetPos(
  config: LinguiConfigNormalized,
  paths: { [locale: string]: string[] },
  segmentsPerLocale: { [locale: string]: TranslationIoSegment[] }
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

    const po = new PO()
    po.headers = getCreateHeaders(targetLocale)

    const items = segments.map<POItem>((segment: TranslationIoSegment) =>
      createPoItemFromSegment(segment)
    )

    // Sort items by messageId
    po.items = items.sort((a, b) => {
      if (a.msgid < b.msgid) {
        return -1
      }
      if (a.msgid > b.msgid) {
        return 1
      }
      return 0
    })

    // Check that localePath directory exists and save PO file
    await fs.promises.mkdir(dirname(localePath), { recursive: true })

    try {
      await writeFile(localePath, po.toString())
    } catch (e) {
      console.error("Error while saving target PO files:")
      console.error(e)
      process.exit(1)
    }
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

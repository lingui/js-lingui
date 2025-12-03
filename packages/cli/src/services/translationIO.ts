import fs from "fs"
import { dirname } from "path"
import PO from "pofile"
import https from "https"
import { globSync } from "glob"
import { format as formatDate } from "date-fns"
import { LinguiConfigNormalized } from "@lingui/conf"
import { CliExtractOptions } from "../lingui-extract"

type POItem = InstanceType<typeof PO.Item>

type TranslationIoSegment = {
  type: string
  source: string
  target?: string
  context?: string
  references?: string[]
  comment?: string
}

type TranslationIoProject = {
  name: string
  url: string
}

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

// Main sync method, call "Init" or "Sync" depending on the project context
export default async function syncProcess(
  config: LinguiConfigNormalized,
  options: CliExtractOptions
) {
  if ((config.format?.catalogExtension?.slice(-2) ?? config.format) !== 'po') {
    console.error(
      `\n----------\nTranslation.io service is only compatible with the "po" format. Please update your Lingui configuration accordingly.\n----------`
    )
    process.exit(1)
  }

  return await new Promise<string>((resolve, reject) => {
    const successCallback = (project: TranslationIoProject) => {
      resolve(
        `\n----------\nProject successfully synchronized. Please use this URL to translate: ${project.url}\n----------`
      )
    }

    const failCallback = (errors: string[]) => {
      reject(
        `\n----------\nSynchronization with Translation.io failed: ${errors.join(
          ", "
        )}\n----------`
      )
    }

    init(config, options, successCallback, (errors) => {
      if (
        errors.length &&
        errors[0] === "This project has already been initialized."
      ) {
        sync(config, options, successCallback, failCallback)
      } else {
        failCallback(errors)
      }
    })
  })
}

// Initialize project with source and existing translations (only first time!)
// Cf. https://translation.io/docs/create-library#initialization
function init(
  config: LinguiConfigNormalized,
  options: CliExtractOptions,
  successCallback: (project: TranslationIoProject) => void,
  failCallback: (errors: string[]) => void
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

  const request = {
    client: "lingui",
    version: require("@lingui/core/package.json").version,
    source_language: sourceLocale,
    target_languages: targetLocales,
    segments: segments,
  }

  postTio(
    "init",
    request,
    config.service.apiKey,
    (response: any) => {
      if (response.errors) {
        failCallback(response.errors)
      } else {
        saveSegmentsToTargetPos(config, paths, response.segments)
        successCallback(response.project)
      }
    },
    (error) => {
      console.error(
        `\n----------\nSynchronization with Translation.io failed: ${error}\n----------`
      )
    }
  )
}

// Send all source text from PO to Translation.io and create new PO based on received translations
// Cf. https://translation.io/docs/create-library#synchronization
function sync(
  config: LinguiConfigNormalized,
  options: CliExtractOptions,
  successCallback: (project: TranslationIoProject) => void,
  failCallback: (errors: string[]) => void
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

  const request = {
    client: "lingui",
    version: require("@lingui/core/package.json").version,
    source_language: sourceLocale,
    target_languages: targetLocales,
    segments: segments,

    // Sync and then remove unused segments (not present in the local application) from Translation.io
    purge: Boolean(options.clean),
  }

  postTio(
    "sync",
    request,
    config.service.apiKey,
    (response: any) => {
      if (response.errors) {
        failCallback(response.errors)
      } else {
        saveSegmentsToTargetPos(config, paths, response.segments)
        successCallback(response.project)
      }
    },
    (error) => {
      console.error(
        `\n----------\nSynchronization with Translation.io failed: ${error}\n----------`
      )
    }
  )
}

function createSegmentFromPoItem(item: POItem) {
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

function createPoItemFromSegment(segment: TranslationIoSegment) {
  const segmentHasExplicitId = segment.comment?.includes(EXPLICIT_ID_FLAG)
  const segmentHasExplicitIdAndContext = segment.comment?.includes(
    EXPLICIT_ID_AND_CONTEXT_FLAG
  )

  const item = new PO.Item()

  if (segmentHasExplicitId || segmentHasExplicitIdAndContext) {
    item.msgid = segment.context
  } else {
    item.msgid = segment.source
    item.msgctxt = segment.context
  }

  item.msgstr = [segment.target]
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

function saveSegmentsToTargetPos(
  config: LinguiConfigNormalized,
  paths: { [locale: string]: string[] },
  segmentsPerLocale: { [locale: string]: TranslationIoSegment[] }
) {
  Object.keys(segmentsPerLocale).forEach((targetLocale) => {
    // Remove existing target POs and JS for this target locale
    paths[targetLocale].forEach((path) => {
      const jsPath = path.replace(/\.po?$/, "") + ".js"
      const dirPath = dirname(path)

      // Remove PO, JS and empty dir
      if (fs.existsSync(path)) {
        fs.unlinkSync(path)
      }
      if (fs.existsSync(jsPath)) {
        fs.unlinkSync(jsPath)
      }
      if (fs.existsSync(dirPath) && fs.readdirSync(dirPath).length === 0) {
        fs.rmdirSync(dirPath)
      }
    })

    // Find target path (ignoring {name})
    const localePath = "".concat(
      config.catalogs[0].path
        .replace(/{locale}/g, targetLocale)
        .replace(/{name}/g, ""),
      ".po"
    )
    const segments = segmentsPerLocale[targetLocale]

    const po = new PO()
    po.headers = getCreateHeaders(targetLocale)

    const items: POItem[] = []

    segments.forEach((segment: TranslationIoSegment) => {
      const item = createPoItemFromSegment(segment)
      items.push(item)
    })

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
    fs.promises.mkdir(dirname(localePath), { recursive: true }).then(() => {
      po.save(localePath, (err) => {
        if (err) {
          console.error("Error while saving target PO files:")
          console.error(err)
          process.exit(1)
        }
      })
    })
  })
}

function poPathsPerLocale(config: LinguiConfigNormalized) {
  const paths: { [locale: string]: string[] } = {}

  config.locales.forEach((locale) => {
    paths[locale] = []

    config.catalogs.forEach((catalog) => {
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

function postTio(
  action: "init" | "sync",
  request: unknown,
  apiKey: string,
  successCallback: (resp: unknown) => void,
  failCallback: (resp: unknown) => void
) {
  const jsonRequest = JSON.stringify(request)

  const options = {
    hostname: "translation.io",
    path: `/api/v1/segments/${action}.json?api_key=${apiKey}`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  }

  const req = https.request(options, (res) => {
    res.setEncoding("utf8")

    let body = ""

    res.on("data", (chunk) => {
      body = body.concat(chunk)
    })

    res.on("end", () => {
      const response = JSON.parse(body)
      successCallback(response)
    })
  })

  req.on("error", (e) => {
    failCallback(e)
  })

  req.write(jsonRequest)
  req.end()
}

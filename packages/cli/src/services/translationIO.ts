import fs from "fs"
import { dirname } from "path"
import PO from "pofile"
import https from "https"
import glob from "glob"
import { format as formatDate } from "date-fns"

const getCreateHeaders = (language) => ({
  "POT-Creation-Date": formatDate(new Date(), "yyyy-MM-dd HH:mmxxxx"),
  "MIME-Version": "1.0",
  "Content-Type": "text/plain; charset=utf-8",
  "Content-Transfer-Encoding": "8bit",
  "X-Generator": "@lingui/cli",
  Language: language,
})

// Main sync method, call "Init" or "Sync" depending on the project context
export default function syncProcess(config, options) {
  if (config.format != "po") {
    console.error(
      `\n----------\nTranslation.io service is only compatible with the "po" format. Please update your Lingui configuration accordingly.\n----------`
    )
    process.exit(1)
  }

  const successCallback = (project) => {
    console.log(
      `\n----------\nProject successfully synchronized. Please use this URL to translate: ${project.url}\n----------`
    )
  }

  const failCallback = (errors) => {
    console.error(
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
}

// Initialize project with source and existing translations (only first time!)
// Cf. https://translation.io/docs/create-library#initialization
function init(config, options, successCallback, failCallback) {
  const sourceLocale = config.sourceLocale || "en"
  const pseudoLocale = config.pseudoLocale || "pseudo"
  const targetLocales = config.locales.filter(
    (value) => value != sourceLocale && value != pseudoLocale
  )
  const paths = poPathsPerLocale(config)

  let segments = {}

  targetLocales.forEach((targetLocale) => {
    segments[targetLocale] = []
  })

  // Create segments from source locale PO items
  paths[sourceLocale].forEach((path) => {
    let raw = fs.readFileSync(path).toString()
    let po = PO.parse(raw)

    po.items
      .filter((item) => !item["obsolete"])
      .forEach((item) => {
        targetLocales.forEach((targetLocale) => {
          let newSegment = createSegmentFromPoItem(item)

          segments[targetLocale].push(newSegment)
        })
      })
  })

  // Add translations to segments from target locale PO items
  targetLocales.forEach((targetLocale) => {
    paths[targetLocale].forEach((path) => {
      let raw = fs.readFileSync(path).toString()
      let po = PO.parse(raw)

      po.items
        .filter((item) => !item["obsolete"])
        .forEach((item, index) => {
          segments[targetLocale][index].target = item.msgstr[0]
        })
    })
  })

  let request = {
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
    (response) => {
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
function sync(config, options, successCallback, failCallback) {
  const sourceLocale = config.sourceLocale || "en"
  const targetLocales = config.locales.filter((value) => value != sourceLocale)
  const paths = poPathsPerLocale(config)

  let segments = []

  // Create segments with correct source
  paths[sourceLocale].forEach((path) => {
    let raw = fs.readFileSync(path).toString()
    let po = PO.parse(raw)

    po.items
      .filter((item) => !item["obsolete"])
      .forEach((item) => {
        let newSegment = createSegmentFromPoItem(item)

        segments.push(newSegment)
      })
  })

  let request = {
    client: "lingui",
    version: require("@lingui/core/package.json").version,
    source_language: sourceLocale,
    target_languages: targetLocales,
    segments: segments,
  }

  // Sync and then remove unused segments (not present in the local application) from Translation.io
  if (options.clean) {
    request["purge"] = true
  }

  postTio(
    "sync",
    request,
    config.service.apiKey,
    (response) => {
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

function createSegmentFromPoItem(item) {
  let itemHasId = item.msgid != item.msgstr[0] && item.msgstr[0].length

  let segment = {
    type: "source", // No way to edit text for source language (inside code), so not using "key" here
    source: itemHasId ? item.msgstr[0] : item.msgid, // msgstr may be empty if --overwrite is used and no ID is used
    context: "",
    references: [],
    comment: "",
  }

  if (itemHasId) {
    segment.context = item.msgid
  }

  if (item.references.length) {
    segment.references = item.references
  }

  if (item.extractedComments.length) {
    segment.comment = item.extractedComments.join(" | ")
  }

  return segment
}

function createPoItemFromSegment(segment) {
  let item = new PO.Item()

  item.msgid = segment.context ? segment.context : segment.source
  item.msgstr = [segment.target]
  item.references =
    segment.references && segment.references.length ? segment.references : []
  item.extractedComments = segment.comment ? segment.comment.split(" | ") : []

  return item
}

function saveSegmentsToTargetPos(config, paths, segmentsPerLocale) {
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

    let po = new PO()
    po.headers = getCreateHeaders(targetLocale)

    let items = []

    segments.forEach((segment) => {
      let item = createPoItemFromSegment(segment)
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

function poPathsPerLocale(config) {
  const paths = []

  config.locales.forEach((locale) => {
    paths[locale] = []

    config.catalogs.forEach((catalog) => {
      const path = "".concat(
        catalog.path.replace(/{locale}/g, locale).replace(/{name}/g, "*"),
        ".po"
      )

      // If {name} is present (replaced by *), list all the existing POs
      if (path.includes("*")) {
        paths[locale] = paths[locale].concat(glob.sync(path))
      } else {
        paths[locale].push(path)
      }
    })
  })

  return paths
}

function postTio(action, request, apiKey, successCallback, failCallback) {
  let jsonRequest = JSON.stringify(request)

  let options = {
    hostname: "translation.io",
    path: "/api/v1/segments/" + action + ".json?api_key=" + apiKey,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  }

  let req = https.request(options, (res) => {
    res.setEncoding("utf8")

    let body = ""

    res.on("data", (chunk) => {
      body = body.concat(chunk)
    })

    res.on("end", () => {
      let response = JSON.parse(body)
      successCallback(response)
    })
  })

  req.on("error", (e) => {
    failCallback(e)
  })

  req.write(jsonRequest)
  req.end()
}

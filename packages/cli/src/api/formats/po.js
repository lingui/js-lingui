// @flow
import fs from "fs"
import * as R from "ramda"

import gettextParser from "gettext-parser"
import { prettyOrigin } from "../utils"
import type { TranslationsFormat } from "../types"

const pad2 = num => ("00" + num.toString()).slice(-2)

const getHeaders = ({ language = "no", ...headers } = {}) => {
  const date = new Date()
  const today = `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate()
  )}`

  return {
    "project-id-version": "Project Name",
    "pot-creation-date": today,
    "po-revision-date": today,
    "last-translator": "",
    "language-team": "",
    "mime-version": "1.0",
    "content-type": "text/plain; charset=utf-8",
    "content-transfer-encoding": "8bit",
    language,
    "x-generator": "@lingui/cli",
    ...headers
  }
}

function writeHeaders(headers) {
  const res = []
  res.push(`msgid ""`)
  res.push(`msgstr ""`)

  Object.keys(headers).forEach(key => res.push(`"${key}: ${headers[key]}\\n"`))

  return res
}

const serialize = R.compose(
  R.values,
  R.mapObjIndexed((message, key) => {
    const translation = message.translation || ""
    const escape = str => str.toString().replace(/"/g, '\\"')

    return [
      "",
      message.description && `#. ${message.description}`,
      message.origin && `#: ${prettyOrigin(message.origin)}`,
      message.obsolete && `#, obsolete`,
      `msgid "${escape(key)}"`,
      `msgstr "${escape(translation)}"`
    ]
      .filter(item => typeof item === "string")
      .join("\n")
  })
)

function parseOrigin(origins) {
  if (!origins) return

  return origins.split(", ").map(origin => origin.split(":"))
}

const deserialize = R.map(message => ({
  translation: message.msgstr.toString(),
  description: R.path(["comments", "extracted"], message),
  obsolete: R.pathEq(["comments", "flag"], "obsolete", message),
  origin: parseOrigin(R.path(["comments", "reference"], message))
}))

const format: TranslationsFormat = {
  filename: "messages.po",

  write(filename, catalog, options = {}) {
    let headers
    if (fs.existsSync(filename)) {
      const raw = fs.readFileSync(filename).toString()
      const prevPo = gettextParser.po.parse(raw)
      headers = prevPo.headers
    } else {
      headers = getHeaders({ language: options.locale })
    }

    const pofile = [...writeHeaders(headers), ...serialize(catalog)].join("\n")
    fs.writeFileSync(filename, pofile + "\n")
  },

  read(filename) {
    const raw = fs.readFileSync(filename).toString()

    const pofile = gettextParser.po.parse(raw)
    const translations = pofile.translations[""]
    delete translations[""] // remove headers
    return deserialize(translations)
  }
}

export default format

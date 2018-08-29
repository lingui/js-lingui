// @flow
import fs from "fs"
import * as R from "ramda"
import { format as formatDate } from "date-fns"

import PO from "pofile"
import { joinOrigin, splitOrigin } from "../utils"
import type { TranslationsFormat } from "../types"

const getCreateHeaders = (language = "no") => ({
  "POT-Creation-Date": formatDate(new Date(), "YYYY-MM-DD HH:mmZZ"),
  "Mime-Version": "1.0",
  "Content-Type": "text/plain; charset=utf-8",
  "Content-Transfer-Encoding": "8bit",
  "X-Generator": "@lingui/cli",
  Language: language
})

const serialize = R.compose(
  R.values,
  R.mapObjIndexed((message, key) => {
    const item = new PO.Item()
    item.msgid = key
    item.msgstr = message.translation
    item.comments = message.comments || []
    item.extractedComments = message.description ? [message.description] : []
    item.references = message.origin ? message.origin.map(joinOrigin) : []
    item.obsolete = message.obsolete
    item.flags = message.flags
      ? R.fromPairs(message.flags.map(flag => [flag, true]))
      : {}
    return item
  })
)

const getMessageKey = R.prop("msgid")
const getTranslations = R.prop("msgstr")
const getExtractedComments = R.prop("extractedComments")
const getTranslatorComments = R.prop("comments")
const getOrigins = R.prop("references")
const getFlags = R.compose(
  R.map(R.trim),
  R.keys,
  R.dissoc("obsolete"), // backward-compatibility, remove in 3.x
  R.prop("flags")
)
const isObsolete = R.either(R.path(["flags", "obsolete"]), R.prop("obsolete"))

const deserialize = R.map(
  R.applySpec({
    translation: R.compose(
      R.head,
      R.defaultTo([]),
      getTranslations
    ),
    description: R.compose(
      R.head,
      R.defaultTo([]),
      getExtractedComments
    ),
    comments: item =>
      R.concat(getTranslatorComments(item), R.tail(getExtractedComments(item))),
    obsolete: isObsolete,
    origin: R.compose(
      R.map(splitOrigin),
      R.defaultTo([]),
      getOrigins
    ),
    flags: getFlags
  })
)

const validateItems = R.map(item => {
  if (R.length(getTranslations(item)) > 1) {
    console.warn(
      "Multiple translations for item with key %s is not supported and it will be ignored.",
      getMessageKey(item)
    )
  }
})

const indexItems = R.indexBy(getMessageKey)

const format: TranslationsFormat = {
  filename: "messages.po",

  write(filename, catalog, options = {}) {
    let po
    let indexedItems = {}
    if (fs.existsSync(filename)) {
      const raw = fs.readFileSync(filename).toString()
      po = PO.parse(raw)
    } else {
      po = new PO()
      po.headers = getCreateHeaders(options.language)
      po.headerOrder = R.keys(po.headers)
    }
    po.items = serialize(catalog)
    fs.writeFileSync(filename, po.toString())
  },

  read(filename) {
    const raw = fs.readFileSync(filename).toString()
    return this.parse(raw)
  },

  parse(raw) {
    const po = PO.parse(raw)
    validateItems(po.items)
    return deserialize(indexItems(po.items))
  }
}

export default format

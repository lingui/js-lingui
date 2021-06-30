import fs from "fs"
import * as R from "ramda"
import { format as formatDate } from "date-fns"
import PO from "pofile"

import { joinOrigin, splitOrigin, writeFileIfChanged } from "../utils"
import { MessageType, CatalogType } from "../catalog"
import { CatalogFormatter } from "."

const getCreateHeaders = (language = "no") => ({
  "POT-Creation-Date": formatDate(new Date(), "yyyy-MM-dd HH:mmxxxx"),
  "MIME-Version": "1.0",
  "Content-Type": "text/plain; charset=utf-8",
  "Content-Transfer-Encoding": "8bit",
  "X-Generator": "@lingui/cli",
  Language: language,
})

const serialize = (items: CatalogType, options) =>
  R.compose(
    R.values,
    R.mapObjIndexed((message: MessageType, key) => {
      const item = new PO.Item()
      item.msgid = key
      item.msgstr = [message.translation]
      item.comments = message.comments || []
      item.extractedComments = message.extractedComments || []
      if (message.context) {
        item.msgctxt = message.context
      }
      if (options.origins !== false) {
        if (message.origin && options.lineNumbers === false) {
          item.references = message.origin.map(msg => msg.slice(0, -1)).map(joinOrigin)
        } else {
          item.references = message.origin ? message.origin.map(joinOrigin) : []
        }
      }
      // @ts-ignore: Figure out how to set this flag
      item.obsolete = message.obsolete
      item.flags = message.flags
        ? R.fromPairs(message.flags.map((flag) => [flag, true]))
        : {}
      return item
    })
  )(items)

const getMessageKey = R.prop<"msgid", string>("msgid")
const getTranslations = R.prop("msgstr")
const getExtractedComments = R.prop("extractedComments")
const getTranslatorComments = R.prop("comments")
const getMessageContext = R.prop("msgctxt")
const getOrigins = R.prop("references")
const getFlags = R.compose(
  R.map(R.trim),
  R.keys,
  R.dissoc("obsolete"), // backward-compatibility, remove in 3.x
  R.prop("flags")
)
const isObsolete = R.either(R.path(["flags", "obsolete"]), R.prop("obsolete"))

const deserialize: (item: Object) => Object = R.map(
  R.applySpec({
    translation: R.compose(R.head, R.defaultTo([]), getTranslations),
    extractedComments: R.compose(R.defaultTo([]), getExtractedComments),
    comments: R.compose(R.defaultTo([]), getTranslatorComments),
    context: R.compose(R.defaultTo(null), getMessageContext),
    obsolete: isObsolete,
    origin: R.compose(R.map(splitOrigin), R.defaultTo([]), getOrigins),
    flags: getFlags,
  })
)

type POItem = InstanceType<typeof PO.Item>
type PoFormatter = {
  parse: (raw: string) => Object
}

const validateItems = R.forEach<POItem>((item) => {
  if (R.length(getTranslations(item)) > 1) {
    console.warn(
      "Multiple translations for item with key %s is not supported and it will be ignored.",
      getMessageKey(item)
    )
  }
})

const indexItems = R.indexBy(getMessageKey)

const po: CatalogFormatter & PoFormatter = {
  catalogExtension: ".po",

  write(filename, catalog, options) {
    let po
    if (fs.existsSync(filename)) {
      const raw = fs.readFileSync(filename).toString()
      po = PO.parse(raw)
    } else {
      po = new PO()
      po.headers = getCreateHeaders(options.locale)
      if (options.locale === undefined) {
        delete po.headers.Language;
      }
      po.headerOrder = R.keys(po.headers)
    }
    po.items = serialize(catalog, options)
    writeFileIfChanged(filename, po.toString())
  },

  read(filename) {
    const raw = fs.readFileSync(filename).toString()
    return this.parse(raw)
  },

  parse(raw: string) {
    const po = PO.parse(raw)
    validateItems(po.items)
    return deserialize(indexItems(po.items))
  },
}

export default po

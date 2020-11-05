import { format as formatDate } from "date-fns"
import fs from "fs"
import ICUParser from "messageformat-parser"
import pluralsCldr from "plurals-cldr"
import PO from "pofile"
import querystring from "querystring"
import * as R from "ramda"

import { CatalogType, MessageType } from "../types"
import { joinOrigin, splitOrigin, writeFileIfChanged } from "../utils"


// Workaround because pofile doesn't support es6 modules, see https://github.com/rubenv/pofile/pull/38#issuecomment-623119284
type POItemType = InstanceType<typeof PO.Item>

function getCreateHeaders(language = "no") {
  return {
    "POT-Creation-Date": formatDate(new Date(), "yyyy-MM-dd HH:mmxxxx"),
    "Mime-Version": "1.0",
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Transfer-Encoding": "8bit",
    "X-Generator": "@lingui/cli",
    Language: language,
  }
}

// Attempts to turn a single tokenized ICU plural case back into a string.
function stringifyICUCase(icuCase) {
  return icuCase.tokens
    .map((token) => {
      if (typeof token === "string") {
        return token
      } else if (token.type === "octothorpe") {
        return "#"
      } else if (token.type === "argument") {
        return "{" + token.arg + "}"
      } else {
        console.warn(
          `Unexpected token "${token}" while stringifying plural case "${icuCase}". Token will be ignored.`
        )
        return ""
      }
    })
    .join("")
}

const serialize = (items: CatalogType, options) => R.compose(
  R.values,
  R.mapObjIndexed((message: MessageType, key) => {
    const item = new PO.Item()
    item.msgid = key

    // Depending on whether custom ids are used by the developer, the (potential plural) "original", untranslated ICU
    // message can be found in `message.message` or in the item's `key` itself.
    const icuMessage = message.message || key

    // Quick check to see if original message is a plural localization.
    if (/^{.*, plural, .*}$/.test(icuMessage.replace(/\n|\r\n/g, " "))) {
      try {
        const [messageAst] = ICUParser.parse(icuMessage)
        
        // Check if any of the plural cases contain plurals themselves.
        if (messageAst.cases.some((icuCase) => icuCase.tokens.some((token) => token.type === "plural"))) {
          console.warn(`Nested plurals cannot be expressed with gettext plurals. ` +
            `Message with key "%s" will not be saved correctly.`, key)
        }

        // Store placeholder that is pluralized upon to allow restoring ICU format later.
        item.msgctxt = querystring.encode({ pluralize_on: messageAst.arg })

        // For the plural key, simple append "_plural" to the original message key (might be the full message or its id)
        item.msgid_plural = key + "_plural"

        // If there is a translated value, parse that instead of the original message to prevent overriding localized
        // content with the original message. If there is no translated value, don't touch msgstr, since marking item as
        // plural (above) already causes `pofile` to automatically generate `msgstr[0]` and `msgstr[1]`.
        if (message.translation) {
          try {
            const [ast] = ICUParser.parse(message.translation)
            item.msgstr = ast.cases.map(stringifyICUCase)
          } catch (e) {
            console.error("Error parsing translation ICU", e)
          }
        }
      } catch (e) {
        console.error("Error parsing message ICU:", e)
      }
    } else {
      item.msgstr = [message.translation]
    }

    item.comments = message.comments || []
    item.extractedComments = message.comment ? [message.comment] : []
    item.references = message.origin ? message.origin.map(joinOrigin) : []
    // @ts-ignore: Figure out how to set this flag
    item.obsolete = message.obsolete
    item.flags = message.flags
      ? R.fromPairs(message.flags.map((flag) => [flag, true]))
      : {}
    return item
  })
)(items)

const getMessageKey = R.prop<"msgid", string>("msgid")
const getTranslations = R.prop<"msgstr", string[]>("msgstr")
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

const getTranslationCount = R.compose(
  R.length,
  getTranslations
)

const deserialize: (Object) => Object = R.map(
  R.applySpec({
    translation: R.compose(R.head, R.defaultTo([]), getTranslations),
    comment: R.compose(R.head, R.defaultTo([]), getExtractedComments),
    comments: (item) =>
      R.concat(
        getTranslatorComments(item) as string,
        R.tail(getExtractedComments(item))
      ),
    obsolete: isObsolete,
    origin: R.compose(R.map(splitOrigin), R.defaultTo([]), getOrigins),
    flags: getFlags,
  })
)

const convertPluralsToICU = (items: POItemType[], lang?: string) => {
  // .po plurals are numbered 0-N and need to be mapped to ICU plural classes ("one", "few", "many"...). Different
  // languages can have different plural classes (some start with "zero", some with "one"), so read that data from CLDR.
  let pluralForms: string[] | null = []
  if (lang) {
    pluralForms = pluralsCldr.forms(lang)
    // Plurals may be `null` if lang is not found. As long as no plural is used, don't report an error.
  }

  items.forEach((item) => {
    const translationCount = getTranslationCount(item)
    const messageKey = getMessageKey(item)

    // Messages without multiple translations (= plural cases) need no further processing.
    if (translationCount <= 1) {
      return
    }

    // msgid_plural must be set, but its actual value is not important.
    if (!item.msgid_plural) {
      console.warn(
        `Multiple translations for item with key "%s" but missing 'msgid_plural' is not supported and it will be ignored.`,
        messageKey
      )
      return
    }

    // If all translations are empty, ignore item.
    if (item.msgstr.every((str) => str.length === 0)) {
      return
    }

    if (pluralForms === null) {
      console.warn(
        `Multiple translations for item with key "%s" in language "${lang}", but no plural cases were found. ` +
          `This prohibits the translation of .po plurals into ICU plurals. Pluralization will not work for this key.`,
        messageKey
      )
      return
    }

    const pluralCount = pluralForms.length
    if (translationCount > pluralCount) {
      console.warn(
        `More translations provided for item with key "%s" (${translationCount}) in language "${lang}" than there are plural cases available (${pluralCount}). ` +
          `This will result in not all translations getting picked up.`,
        messageKey
      )
    }

    // Map each msgstr to a "<pluralform> {<translated_string>}" entry, joined by one space.
    const pluralClauses = item.msgstr
      .map((str, index) => pluralForms[index] + " {" + str + "}")
      .join(" ")

    // Find out placeholder name from item's message context, defaulting to "count".
    let { pluralize_on: pluralizeOn } = querystring.parse(item.msgctxt)

    if (!pluralizeOn) {
      console.warn(
        `Unable to determine plural placeholder name for item with key "%s" (should be stored in "msgctxt"), assuming "count".`,
        messageKey
      )
      pluralizeOn = "count"
    }

    item.msgstr = ["{" + pluralizeOn + ", plural, " + pluralClauses + "}"]
  })
}

const indexItems = R.indexBy(getMessageKey)

export default {
  catalogExtension: ".po",

  write(filename, catalog: CatalogType, options) {
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
      po.headerOrder = Object.keys(po.headers)
    }
    po.items = this.serialize(catalog, options)
    writeFileIfChanged(filename, po.toString())
  },

  serialize,

  read(filename) {
    const raw = fs.readFileSync(filename).toString()
    return this.parse(raw)
  },

  parse(raw) {
    const po = PO.parse(raw)
    convertPluralsToICU(po.items, po.headers.Language)
    return deserialize(indexItems(po.items))
  }
}
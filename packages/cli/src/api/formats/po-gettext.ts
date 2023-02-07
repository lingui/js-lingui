import { format as formatDate } from "date-fns"
import fs from "fs"
import { parse as parseIcu, Select, SelectCase } from "@messageformat/parser"
import pluralsCldr from "plurals-cldr"
import PO from "pofile"
import * as R from "ramda"
import gettextPlurals from "node-gettext/lib/plurals"

import { CatalogType, MessageType } from "../catalog"
import { joinOrigin, splitOrigin, writeFileIfChanged } from "../utils"
import type { CatalogFormatOptionsInternal, CatalogFormatter } from "./"

// Workaround because pofile doesn't support es6 modules, see https://github.com/rubenv/pofile/pull/38#issuecomment-623119284
type POItemType = InstanceType<typeof PO.Item>

function getCreateHeaders(language = "no") {
  return {
    "POT-Creation-Date": formatDate(new Date(), "yyyy-MM-dd HH:mmxxxx"),
    "MIME-Version": "1.0",
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Transfer-Encoding": "8bit",
    "X-Generator": "@lingui/cli",
    Language: language,
  }
}

// Attempts to turn a single tokenized ICU plural case back into a string.
function stringifyICUCase(icuCase: SelectCase): string {
  return icuCase.tokens
    .map((token) => {
      if (token.type === "content") {
        return token.value
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

const ICU_PLURAL_REGEX = /^{.*, plural, .*}$/
const ICU_SELECT_REGEX = /^{.*, select(Ordinal)?, .*}$/
const LINE_ENDINGS = /\r?\n/g

// Prefix that is used to identitify context information used by this module in PO's "extracted comments".
const CTX_PREFIX = "js-lingui:"

const serialize = (
  items: CatalogType,
  options: CatalogFormatOptionsInternal & { disableSelectWarning: boolean }
) =>
  R.compose(
    R.values,
    R.mapObjIndexed((message: MessageType, key) => {
      const item = new PO.Item()
      item.msgid = key
      item.comments = message.comments || []

      // The extractedComments array may be modified in this method, so create a new array with the message's elements.
      // Destructuring `undefined` is forbidden, so fallback to `[]` if the message has no extracted comments.
      item.extractedComments = [...(message.extractedComments ?? [])]

      if (message.context) {
        item.msgctxt = message.context
      }
      if (options.origins !== false) {
        if (message.origin && options.lineNumbers === false) {
          item.references = message.origin.map(([path]) => path)
        } else {
          item.references = message.origin ? message.origin.map(joinOrigin) : []
        }
      }

      // @ts-ignore: Figure out how to set this flag
      item.obsolete = message.obsolete
      item.flags = message.flags
        ? R.fromPairs(message.flags.map((flag) => [flag, true]))
        : {}

      // Depending on whether custom ids are used by the developer, the (potential plural) "original", untranslated ICU
      // message can be found in `message.message` or in the item's `key` itself.
      const icuMessage = message.message || key

      const _simplifiedMessage = icuMessage.replace(LINE_ENDINGS, " ")

      // Quick check to see if original message is a plural localization.
      if (ICU_PLURAL_REGEX.test(_simplifiedMessage)) {
        try {
          const messageAst = parseIcu(icuMessage)[0] as Select

          // Check if any of the plural cases contain plurals themselves.
          if (
            messageAst.cases.some((icuCase) =>
              icuCase.tokens.some((token) => token.type === "plural")
            )
          ) {
            console.warn(
              `Nested plurals cannot be expressed with gettext plurals. ` +
                `Message with key "%s" will not be saved correctly.`,
              key
            )
          }

          // Store placeholder that is pluralized upon to allow restoring ICU format later.
          const ctx = new URLSearchParams({
            pluralize_on: messageAst.arg,
          })

          if (message.message == null) {
            // For messages without developer-set ID, use first case as `msgid` and the last case as `msgid_plural`.
            // This does not necessarily make sense for development languages with more than two numbers, but gettext
            // only supports exactly two plural forms.
            item.msgid = stringifyICUCase(messageAst.cases[0])
            item.msgid_plural = stringifyICUCase(
              messageAst.cases[messageAst.cases.length - 1]
            )

            // Since the original msgid is overwritten, store ICU message to allow restoring that ID later.
            ctx.set("icu", key)
          } else {
            // For messages with developer-set ID, append `_plural` to the key to generate `msgid_plural`.
            item.msgid_plural = key + "_plural"
          }

          ctx.sort()
          item.extractedComments.push(CTX_PREFIX + ctx.toString())

          // If there is a translated value, parse that instead of the original message to prevent overriding localized
          // content with the original message. If there is no translated value, don't touch msgstr, since marking item as
          // plural (above) already causes `pofile` to automatically generate `msgstr[0]` and `msgstr[1]`.
          if (message.translation?.length > 0) {
            try {
              const ast = parseIcu(message.translation)[0] as Select
              if (ast.cases == null) {
                console.warn(
                  `Found translation without plural cases for key "${key}". ` +
                    `This likely means that a translated .po file misses multiple msgstr[] entries for the key. ` +
                    `Translation found: "${message.translation}"`
                )
                item.msgstr = [message.translation]
              } else {
                item.msgstr = ast.cases.map(stringifyICUCase)
              }
            } catch (e) {
              console.error(`Error parsing translation ICU for key "${key}"`, e)
            }
          }
        } catch (e) {
          console.error(`Error parsing message ICU for key "${key}":`, e)
        }
      } else {
        if (
          !options.disableSelectWarning &&
          ICU_SELECT_REGEX.test(_simplifiedMessage)
        ) {
          console.warn(
            `ICU 'select' and 'selectOrdinal' formats cannot be expressed natively in gettext format. ` +
              `Item with key "%s" will be included in the catalog as raw ICU message. ` +
              `To disable this warning, include '{ disableSelectWarning: true }' in the config's 'formatOptions'`,
            key
          )
        }
        item.msgstr = [message.translation]
      }

      return item
    })
  )(items)

const getMessageKey = R.prop<"msgid", string>("msgid")
const getTranslations = R.prop<"msgstr", string[]>("msgstr")
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

const getTranslationCount = R.compose(R.length, getTranslations)

const deserialize: (Object) => Object = R.map(
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

/**
 * Returns ICU case labels in the order that gettext lists localized messages, e.g. 0,1,2 => `["one", "two", "other"]`.
 *
 * Obtaining the ICU case labels for gettext-supported inputs (gettext doesn't support fractions, even though some
 * languages have a separate case for fractional numbers) works by applying the CLDR selector to the example values
 * listed in the node-gettext plurals module.
 *
 * This approach is heavily influenced by
 * https://github.com/LLK/po2icu/blob/9eb97f81f72b2fee02b77f1424702e019647e9b9/lib/po2icu.js#L148.
 */
const getPluralCases = (lang: string): string[] | undefined => {
  // If users uses locale with underscore or slash, es-ES, es_ES, gettextplural is "es" not es-ES.
  const [correctLang] = lang.split(/[-_]/g)
  const gettextPluralsInfo = gettextPlurals[correctLang]

  return gettextPluralsInfo?.examples.map((pluralCase) =>
    pluralsCldr(correctLang, pluralCase.sample)
  )
}

const convertPluralsToICU = (items: POItemType[], lang?: string) => {
  // .po plurals are numbered 0-N and need to be mapped to ICU plural classes ("one", "few", "many"...). Different
  // languages can have different plural classes (some start with "zero", some with "one"), so read that data from CLDR.
  // `pluralForms` may be `null` if lang is not found. As long as no plural is used, don't report an error.
  let pluralForms = getPluralCases(lang)

  items.forEach((item) => {
    const translationCount = getTranslationCount(item)
    const messageKey = getMessageKey(item)

    // Messages without multiple translations (= plural cases) need no further processing.
    if (translationCount <= 1 && !item.msgid_plural) {
      return
    }

    // msgid_plural must be set, but its actual value is not important.
    if (!item.msgid_plural) {
      console.warn(
        `Multiple translations for item with key "%s" but missing 'msgid_plural' in catalog "${lang}". This is not supported and the plural cases will be ignored.`,
        messageKey
      )
      return
    }

    const contextComment = item.extractedComments
      .find((comment) => comment.startsWith(CTX_PREFIX))
      ?.substr(CTX_PREFIX.length)
    const ctx = new URLSearchParams(contextComment)

    if (contextComment != null) {
      item.extractedComments = item.extractedComments.filter(
        (comment) => !comment.startsWith(CTX_PREFIX)
      )
    }

    // If an original ICU was stored, use that as `msgid` to match the catalog that was originally exported.
    const storedICU = ctx.get("icu")
    if (storedICU != null) {
      item.msgid = storedICU
    }

    // If all translations are empty, ignore item.
    if (item.msgstr.every((str) => str.length === 0)) {
      return
    }

    if (pluralForms == null) {
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
        `More translations provided (${translationCount}) for item with key "%s" in language "${lang}" than there are plural cases available (${pluralCount}). ` +
          `This will result in not all translations getting picked up.`,
        messageKey
      )
    }

    // Map each msgstr to a "<pluralform> {<translated_string>}" entry, joined by one space.
    const pluralClauses = item.msgstr
      .map((str, index) => pluralForms[index] + " {" + str + "}")
      .join(" ")

    // Find out placeholder name from item's message context, defaulting to "count".
    let pluralizeOn = ctx.get("pluralize_on")
    if (!pluralizeOn) {
      console.warn(
        `Unable to determine plural placeholder name for item with key "%s" in language "${lang}" (should be stored in a comment starting with "#. ${CTX_PREFIX}"), assuming "count".`,
        messageKey
      )
      pluralizeOn = "count"
    }

    item.msgstr = ["{" + pluralizeOn + ", plural, " + pluralClauses + "}"]
  })
}

const indexItems = R.indexBy(getMessageKey)

type PoFormatter = {
  parse: (raw: string) => Object
  serialize: (
    catalog: CatalogType,
    options: Record<string, any>
  ) => POItemType[]
}

const poGettext: CatalogFormatter & PoFormatter = {
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
        delete po.headers.Language
      }
      po.headerOrder = Object.keys(po.headers)
    }
    po.items = this.serialize(catalog, options)
    writeFileIfChanged(filename, po.toString())
  },

  // Mainly exported for easier testing
  serialize,

  read(filename) {
    const raw = fs.readFileSync(filename).toString()
    return this.parse(raw)
  },

  parse(raw: string) {
    const po = PO.parse(raw)
    convertPluralsToICU(po.items, po.headers.Language)
    return deserialize(indexItems(po.items))
  },
}

export default poGettext

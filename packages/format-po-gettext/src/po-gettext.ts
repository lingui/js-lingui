import { parse as parseIcu, Select, SelectCase } from "@messageformat/parser"
import pluralsCldr from "plurals-cldr"
import PO from "pofile"
// @ts-ignore
import gettextPlurals from "node-gettext/lib/plurals"

import type { CatalogFormatter, CatalogType, MessageType } from "@lingui/conf"
import { generateMessageId } from "@lingui/message-utils/generateMessageId"
import { formatter as poFormatter } from "@lingui/format-po"
import type { PoFormatterOptions } from "@lingui/format-po"
import { getCldrPluralSamples } from "./plural_samples"

type POItem = InstanceType<typeof PO.Item>

export type PoGettextFormatterOptions = PoFormatterOptions & {
  disableSelectWarning?: boolean
  customICUPrefix?: string
}

const cldrSamples = getCldrPluralSamples()

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
const DEFAULT_CTX_PREFIX = "js-lingui:"

function serializePlurals(
  item: POItem,
  message: MessageType,
  id: string,
  isGeneratedId: boolean,
  options: PoGettextFormatterOptions
): POItem {
  // Depending on whether custom ids are used by the developer, the (potential plural) "original", untranslated ICU
  // message can be found in `message.message` or in the item's `key` itself.
  const icuMessage = message.message
  const ctxPrefix = options.customICUPrefix || DEFAULT_CTX_PREFIX

  if (!icuMessage) {
    return item
  }

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
          id
        )
      }

      // Store placeholder that is pluralized upon to allow restoring ICU format later.
      const ctx = new URLSearchParams({
        pluralize_on: messageAst.arg,
      })

      if (isGeneratedId) {
        // For messages without developer-set ID, use first case as `msgid` and the last case as `msgid_plural`.
        // This does not necessarily make sense for development languages with more than two numbers, but gettext
        // only supports exactly two plural forms.
        item.msgid = stringifyICUCase(messageAst.cases[0])
        item.msgid_plural = stringifyICUCase(
          messageAst.cases[messageAst.cases.length - 1]
        )

        // Since the original msgid is overwritten, store ICU message to allow restoring that ID later.
        ctx.set("icu", icuMessage)
      } else {
        // For messages with developer-set ID, append `_plural` to the key to generate `msgid_plural`.
        item.msgid_plural = id + "_plural"
      }

      ctx.sort()
      item.extractedComments.push(ctxPrefix + ctx.toString())

      // If there is a translated value, parse that instead of the original message to prevent overriding localized
      // content with the original message. If there is no translated value, don't touch msgstr, since marking item as
      // plural (above) already causes `pofile` to automatically generate `msgstr[0]` and `msgstr[1]`.
      if (message.translation?.length > 0) {
        const ast = parseIcu(message.translation)[0] as Select
        if (ast.cases == null) {
          console.warn(
            `Found translation without plural cases for key "${id}". ` +
              `This likely means that a translated .po file misses multiple msgstr[] entries for the key. ` +
              `Translation found: "${message.translation}"`
          )
          item.msgstr = [message.translation]
        } else {
          item.msgstr = ast.cases.map(stringifyICUCase)
        }
      }
    } catch (e) {
      console.error(`Error parsing message ICU for key "${id}":`, e)
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
        id
      )
    }
    item.msgstr = [message.translation]
  }

  return item
}

type GettextPluralsInfo = {
  nplurals: number
  pluralsFunc: (n: number) => number
}
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
const getPluralCases = (
  lang: string,
  pluralFormsHeader: string
): string[] | undefined => {
  let gettextPluralsInfo: GettextPluralsInfo

  if (pluralFormsHeader) {
    gettextPluralsInfo = parsePluralFormsFn(pluralFormsHeader)
  }

  // If users uses locale with underscore or slash, es-ES, es_ES, gettextplural is "es" not es-ES.
  const [correctLang] = lang.split(/[-_]/g)

  if (!gettextPluralsInfo) {
    gettextPluralsInfo = gettextPlurals[correctLang]
  }

  if (!gettextPluralsInfo) {
    // do not warn on pseudo
    if (lang !== "pseudo") {
      console.warn(
        `No plural rules found for language "${lang}". Please add a Plural-Forms header.`
      )
    }
    return undefined
  }

  const cases: string[] = [...Array(pluralsCldr.forms(correctLang).length)]

  for (let form of pluralsCldr.forms(correctLang)) {
    const samples = cldrSamples[correctLang][form]
    // both need to cast to Number - funcs test with `===` and may return boolean
    const pluralForm = Number(
      gettextPluralsInfo.pluralsFunc(Number(samples[0]))
    )

    cases[pluralForm] = form
  }

  return cases
}

function parsePluralFormsFn(pluralFormsHeader: string): GettextPluralsInfo {
  const [npluralsExpr, expr] = pluralFormsHeader.split(";")

  try {
    const nplurals = new Function(npluralsExpr + "; return nplurals;")()
    const pluralsFunc = new Function(
      "n",
      expr + "; return plural;"
    ) as GettextPluralsInfo["pluralsFunc"]

    return {
      nplurals,
      pluralsFunc,
    }
  } catch (e) {
    console.warn(
      `Plural-Forms header has incorrect value: ${pluralFormsHeader}`
    )
    return undefined
  }
}

const convertPluralsToICU = (
  item: POItem,
  pluralForms: string[],
  lang: string,
  ctxPrefix: string = DEFAULT_CTX_PREFIX
) => {
  const translationCount = item.msgstr.length
  const messageKey = item.msgid

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
    .find((comment) => comment.startsWith(ctxPrefix))
    ?.substring(ctxPrefix.length)
  const ctx = new URLSearchParams(contextComment)

  if (contextComment != null) {
    item.extractedComments = item.extractedComments.filter(
      (comment) => !comment.startsWith(ctxPrefix)
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
      `Multiple translations for item with key "%s" in language "${lang}", but no plural cases were found. ` +
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
    .map((str, index) =>
      pluralForms[index] ? pluralForms[index] + " {" + str + "}" : ""
    )
    .join(" ")

  // Find out placeholder name from item's message context, defaulting to "count".
  let pluralizeOn = ctx.get("pluralize_on")
  if (!pluralizeOn) {
    console.warn(
      `Unable to determine plural placeholder name for item with key "%s" in language "${lang}" (should be stored in a comment starting with "#. ${ctxPrefix}"), assuming "count".`,
      messageKey
    )
    pluralizeOn = "count"
  }

  item.msgstr = ["{" + pluralizeOn + ", plural, " + pluralClauses + "}"]
}

export function formatter(
  options: PoGettextFormatterOptions = {}
): CatalogFormatter {
  options = {
    origins: true,
    lineNumbers: true,
    ...options,
  }

  const formatter = poFormatter(options)

  return {
    catalogExtension: ".po",
    templateExtension: ".pot",

    parse(content, ctx): CatalogType {
      const po = PO.parse(content)

      // .po plurals are numbered 0-N and need to be mapped to ICU plural classes ("one", "few", "many"...). Different
      // languages can have different plural classes (some start with "zero", some with "one"), so read that data from CLDR.
      // `pluralForms` may be `null` if lang is not found. As long as no plural is used, don't report an error.
      let pluralForms = getPluralCases(
        po.headers.Language,
        po.headers["Plural-Forms"]
      )

      po.items.forEach((item) => {
        convertPluralsToICU(
          item,
          pluralForms,
          po.headers.Language,
          options.customICUPrefix
        )
      })

      return formatter.parse(po.toString(), ctx) as CatalogType
    },

    serialize(catalog, ctx): string {
      const po = PO.parse(formatter.serialize(catalog, ctx) as string)

      po.items = po.items.map((item) => {
        const isGeneratedId = !item.extractedComments.includes(
          "js-lingui-explicit-id"
        )
        const id = isGeneratedId
          ? generateMessageId(item.msgid, item.msgctxt)
          : item.msgid
        const message = catalog[id]
        return serializePlurals(item, message, id, isGeneratedId, options)
      })

      return po.toString()
    },
  }
}

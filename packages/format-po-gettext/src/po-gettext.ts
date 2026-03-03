import { parse as parseIcu, Select, SelectCase } from "@messageformat/parser"
import PO from "pofile"

import type { CatalogFormatter, CatalogType, MessageType } from "@lingui/conf"
import { generateMessageId } from "@lingui/message-utils/generateMessageId"
import { formatter as poFormatter } from "@lingui/format-po"
import type { PoFormatterOptions } from "@lingui/format-po"
import { mapGettextPlurals2Icu } from "./utils/mapGettextPlurals2Icu"

type POItem = InstanceType<typeof PO.Item>

export type PoGettextFormatterOptions = PoFormatterOptions & {
  /**
   * Disable warning about unsupported `Select` feature encountered in catalogs
   *
   * @default false
   */
  disableSelectWarning?: boolean
  /**
   * Overrides the default prefix for icu and plural comments in the final PO catalog.
   *
   * @default "js-lingui:"
   */
  customICUPrefix?: string
  /**
   * Combine plural entries that have the same content but different variables into a single PO entry
   */
  mergePlurals?: boolean
}

type PluralizationContext = {
  icu?: string
  pluralizeOn: string[]
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
          `Unexpected token "${token}" while stringifying plural case "${icuCase}". Token will be ignored.`,
        )
        return ""
      }
    })
    .join("")
}

const ICU_PLURAL_REGEX = /^{.*, plural, .*}$/
const ICU_SELECT_REGEX = /^{.*, select(Ordinal)?, .*}$/
const LINE_ENDINGS = /\r?\n/g

// Prefix that is used to identify context information used by this module in PO's "extracted comments".
const DEFAULT_CTX_PREFIX = "js-lingui:"

function serializePlurals(
  item: POItem,
  message: MessageType,
  id: string,
  isGeneratedId: boolean,
  options: PoGettextFormatterOptions,
  formatterCtx: { locale: string | undefined; sourceLocale: string },
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
          icuCase.tokens.some((token) => token.type === "plural"),
        )
      ) {
        console.warn(
          `Nested plurals cannot be expressed with gettext plurals. ` +
            `Message with key "%s" will not be saved correctly.`,
          id,
        )
      }

      // Store placeholder that is pluralized upon to allow restoring ICU format later.
      const ctx: PluralizationContext = {
        pluralizeOn: [messageAst.arg],
      }

      if (isGeneratedId) {
        // For messages without developer-set ID, use first case as `msgid` and the last case as `msgid_plural`.
        // This does not necessarily make sense for development languages with more than two numbers, but gettext
        // only supports exactly two plural forms.
        item.msgid = stringifyICUCase(messageAst.cases[0])
        item.msgid_plural = stringifyICUCase(
          messageAst.cases[messageAst.cases.length - 1],
        )

        // Since the original msgid is overwritten, store ICU message to allow restoring that ID later.
        ctx.icu = icuMessage
      } else {
        // For messages with developer-set ID, append `_plural` to the key to generate `msgid_plural`.
        item.msgid_plural = id + "_plural"
      }

      item.extractedComments.push(ctxPrefix + serializeContextToComment(ctx))

      // If there is a translated value, parse that instead of the original message to prevent overriding localized
      // content with the original message. If there is no translated value, don't touch msgstr, since marking item as
      // plural (above) already causes `pofile` to automatically generate `msgstr[0]` and `msgstr[1]`.
      if (message.translation) {
        const ast = parseIcu(message.translation)[0] as Select
        if (ast.cases == null) {
          console.warn(
            `Found translation without plural cases for key "${id}". ` +
              `This likely means that a translated .po file misses multiple msgstr[] entries for the key. ` +
              `Translation found: "${message.translation}"`,
          )
          item.msgstr = [message.translation]
        } else {
          item.msgstr = ast.cases.map(stringifyICUCase)
        }
      } else if (
        !isGeneratedId &&
        (formatterCtx.locale === formatterCtx.sourceLocale ||
          !formatterCtx.locale)
      ) {
        item.msgstr = messageAst.cases.map(stringifyICUCase)
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
          `To disable this warning, include '{ disableSelectWarning: true }' in the options for this formatter`,
        id,
      )
    }
    item.msgstr = message.translation ? [message.translation] : []
  }

  return item
}

const convertPluralsToICU = (
  item: POItem,
  pluralForms: string[] | undefined,
  lang: string,
  ctxPrefix: string = DEFAULT_CTX_PREFIX,
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
      messageKey,
    )
    return
  }

  const ctx = getContextFromComments(item.extractedComments, ctxPrefix)

  if (ctx) {
    // drop the comment
    item.extractedComments = item.extractedComments.filter(
      (comment) => !comment.startsWith(ctxPrefix),
    )
  }

  // If an original ICU was stored, use that as `msgid` to match the catalog that was originally exported.
  const storedICU = ctx?.icu
  if (storedICU != null) {
    item.msgid = storedICU
  }

  // If all translations are empty, ignore item.
  if (item.msgstr.every((str) => str.length === 0)) {
    return
  }

  if (!pluralForms) {
    console.warn(
      `Multiple translations for item with key "%s" in language "${lang}", but no plural cases were found. ` +
        `This prohibits the translation of .po plurals into ICU plurals. Pluralization will not work for this key.`,
      messageKey,
    )
    return
  }

  const pluralCount = pluralForms.length
  if (translationCount > pluralCount) {
    console.warn(
      `More translations provided (${translationCount}) for item with key "%s" in language "${lang}" than there are plural cases available (${pluralCount}). ` +
        `This will result in not all translations getting picked up.`,
      messageKey,
    )
  }

  // Map each msgstr to a "<pluralform> {<translated_string>}" entry, joined by one space.
  const pluralClauses = item.msgstr
    .map((str, index) =>
      pluralForms[index] ? pluralForms[index] + " {" + str + "}" : "",
    )
    .join(" ")

  // Find out placeholder name from item's message context, defaulting to "count".
  let pluralizeOn = ctx?.pluralizeOn?.[0]
  if (!pluralizeOn) {
    console.warn(
      `Unable to determine plural placeholder name for item with key "%s" in language "${lang}" (should be stored in a comment starting with "#. ${ctxPrefix}"), assuming "count".`,
      messageKey,
    )
    pluralizeOn = "count"
  }

  item.msgstr = ["{" + pluralizeOn + ", plural, " + pluralClauses + "}"]
}

const updateContextComment = (
  item: POItem,
  contextComment: string,
  ctxPrefix: string,
) => {
  item.extractedComments = [
    ...item.extractedComments.filter((c) => !c.startsWith(ctxPrefix)),
    ctxPrefix + contextComment,
  ]
}

function serializeContextToComment(ctx: PluralizationContext) {
  const urlParams = new URLSearchParams()

  if (ctx.icu) {
    urlParams.set("icu", ctx.icu)
  }

  if (ctx.pluralizeOn) {
    urlParams.set("pluralize_on", ctx.pluralizeOn.join(","))
  }

  urlParams.sort()
  return urlParams.toString()
}

function getContextFromComments(
  extractedComments: string[],
  ctxPrefix: string,
): PluralizationContext | undefined {
  const contextComment = extractedComments.find((comment) =>
    comment.startsWith(ctxPrefix),
  )

  if (!contextComment) {
    return undefined
  }

  const urlParams = new URLSearchParams(
    contextComment.substring(ctxPrefix.length),
  )

  return {
    icu: urlParams.get("icu")!,
    pluralizeOn: urlParams.get("pluralize_on")
      ? urlParams.get("pluralize_on")!.split(",")
      : [],
  }
}

/**
 * Merges duplicate PO items that have the same msgid and msgid_plural
 * This happens when plural calls have identical strings but different variables
 */
function mergeDuplicatePluralEntries(
  items: POItem[],
  options: PoGettextFormatterOptions,
): POItem[] {
  const ctxPrefix = options.customICUPrefix || DEFAULT_CTX_PREFIX
  const itemMap = new Map<string, POItem[]>()

  // Group items by msgid + msgid_plural combination
  for (const item of items) {
    // Only merge items that have msgid_plural (i.e., plural entries)
    if (item.msgid_plural) {
      const key = `${item.msgid}|||${item.msgid_plural}`
      if (!itemMap.has(key)) {
        itemMap.set(key, [])
      }
      itemMap.get(key)!.push(item)
    }
  }

  const mergedItems: POItem[] = []

  for (const duplicateItems of itemMap.values()) {
    if (duplicateItems.length === 1) {
      // No duplicates, add the item as-is
      mergedItems.push(duplicateItems[0])
    } else {
      // Merge duplicate items
      const mergedItem = duplicateItems[0] // Use first item as base

      const allVariables = duplicateItems.map((item) => {
        const ctx = getContextFromComments(item.extractedComments, ctxPrefix)
        return ctx?.pluralizeOn[0] || "count"
      })

      const ctx = getContextFromComments(
        mergedItem.extractedComments,
        ctxPrefix,
      )

      if (!ctx) {
        // malformed plural without a comment, skipping
        continue
      }

      // Replace the existing extracted comment (starting with ctxPrefix) with the new one
      updateContextComment(
        mergedItem,
        serializeContextToComment({
          icu: ctx.icu
            ? replaceArgInIcu(ctx.icu, allVariables[0], "$var")
            : ctx.icu,
          pluralizeOn: allVariables,
        }),
        ctxPrefix,
      )

      // Merge references
      mergedItem.references = duplicateItems.flatMap((item) => item.references)

      mergedItems.push(mergedItem)
    }
  }

  return mergedItems
}

function replaceArgInIcu(icu: string, oldVar: string, newVar: string) {
  return icu.replace(new RegExp(`{${oldVar}, plural,`), `{${newVar}, plural,`)
}

/**
 * Expands merged PO entries back into individual entries for compilation
 * This ensures all original message IDs are available in the compiled catalog
 */
function expandMergedPluralEntries(
  items: POItem[],
  options: PoGettextFormatterOptions,
): POItem[] {
  const ctxPrefix = options.customICUPrefix || DEFAULT_CTX_PREFIX
  const expandedItems: POItem[] = []

  for (const item of items) {
    if (!item.msgid_plural) {
      // Not a plural entry, keep as-is
      expandedItems.push(item)
      continue
    }

    const ctx = getContextFromComments(item.extractedComments, ctxPrefix)

    if (!ctx) {
      // warn and continue
      console.warn(
        `Plural entry with msgid "${item.msgid}" is missing context information for expansion.`,
      )
      expandedItems.push(item)
      continue
    }

    const variableList = ctx.pluralizeOn

    if (variableList.length === 1) {
      // No variables to expand, keep as-is
      expandedItems.push(item)
      continue
    }

    // Create a new item for each variable after first
    for (const variable of variableList) {
      const newItem = new PO.Item()

      // Set the msgid to the original ICU message
      newItem.msgid = item.msgid
      newItem.msgid_plural = item.msgid_plural // Keep same plural
      newItem.msgstr = [...item.msgstr]
      newItem.msgctxt = item.msgctxt

      newItem.comments = [...item.comments]

      updateContextComment(
        item,
        serializeContextToComment({
          pluralizeOn: [variable],
          // get icu comment, replace variable placeholder with current variable
          icu: ctx.icu ? replaceArgInIcu(ctx.icu, "\\$var", variable) : ctx.icu,
        }),
        ctxPrefix,
      )

      newItem.extractedComments = item.extractedComments
      newItem.flags = { ...item.flags }

      expandedItems.push(newItem)
    }
  }

  return expandedItems
}

export function formatter(
  options: PoGettextFormatterOptions = {},
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

      if (options.mergePlurals) {
        // Expand merged entries back to individual catalog entries BEFORE ICU conversion
        po.items = expandMergedPluralEntries(po.items, options)
      }

      const language = po.headers.Language

      if (!language) {
        throw new Error(
          `No language defined for catalog. Please add a Language header.`,
        )
      }

      // .po plurals are numbered 0-N and need to be mapped to ICU plural classes ("one", "few", "many"...). Different
      // languages can have different plural classes (some start with "zero", some with "one"), so read that data from CLDR.
      // `pluralForms` may be `null` if lang is not found. As long as no plural is used, don't report an error.
      const pluralForms = mapGettextPlurals2Icu(
        language,
        po.headers["Plural-Forms"],
      )

      po.items.forEach((item) => {
        convertPluralsToICU(
          item,
          pluralForms,
          language,
          options.customICUPrefix,
        )
      })

      return formatter.parse(po.toString(), ctx) as CatalogType
    },

    serialize(catalog, ctx): string {
      const po = PO.parse(formatter.serialize(catalog, ctx) as string)

      po.items = po.items.map((item) => {
        const isGeneratedId = !item.extractedComments.includes(
          "js-lingui-explicit-id",
        )
        const id = isGeneratedId
          ? generateMessageId(item.msgid, item.msgctxt)
          : item.msgid
        const message = catalog[id]
        return serializePlurals(item, message, id, isGeneratedId, options, ctx)
      })

      if (options.mergePlurals) {
        // Merge duplicate entries that have the same msgid and msgid_plural
        const mergedPlurals = mergeDuplicatePluralEntries(po.items, options)
        const newItems: POItem[] = []
        const processed = new Set<POItem>()

        // adding it this way versus just adding all mergedPlurals preserves order of translations

        po.items.forEach((item) => {
          if (!item.msgid_plural) {
            newItems.push(item)
          } else {
            const mergedItem = mergedPlurals.find(
              (merged) =>
                merged.msgid === item.msgid &&
                merged.msgid_plural === item.msgid_plural,
            )
            if (mergedItem && !processed.has(mergedItem)) {
              processed.add(mergedItem)
              newItems.push(mergedItem)
            }
          }
        })

        po.items = newItems
      }

      return po.toString()
    },
  }
}

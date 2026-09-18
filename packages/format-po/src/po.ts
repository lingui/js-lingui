import {
  parsePo,
  stringifyPo,
  createPoFile,
  createItem,
  type PoFile,
  type PoItem,
  type Headers as POHeaders,
  type SerializeOptions,
} from "pofile-ts"

import { CatalogFormatter, CatalogType, MessageType } from "@lingui/conf"
import { generateMessageId } from "@lingui/message-utils/generateMessageId"
import { formatPotCreationDate, normalizePlaceholderValue } from "./utils"

const splitOrigin = (origin: string) => {
  const [file, line] = origin.split(":")
  return [file, line ? Number(line) : null] as [file: string, line: number]
}

const splitMultiLineComments = (comments: string[]) => {
  return comments.flatMap((comment) =>
    comment.includes("\n")
      ? comment
          .split("\n")
          .map((slice) => slice.trim())
          .filter(Boolean)
      : comment,
  )
}

/**
 * @internal
 */
export type POCatalogExtra = {
  translatorComments?: string[]
  flags?: string[]
}

const joinOrigin = (origin: [file: string, line?: number]): string =>
  origin.join(":")

export type PoFormatterOptions = {
  /**
   * Print places where message is used
   *
   * @default true
   */
  origins?: boolean

  /**
   * Print line numbers in origins
   *
   * @default true
   */
  lineNumbers?: boolean

  /**
   * Print `js-lingui-id: Xs4as` statement in extracted comments section
   *
   * @default false
   */
  printLinguiId?: boolean

  /**
   * By default, the po-formatter treats the pair `msgid` + `msgctx` as the source
   * for generating an ID by hashing its value.
   *
   * For messages with explicit IDs, the formatter adds a special comment `js-lingui-explicit-id` as a flag.
   * When this flag is present, the formatter will use the `msgid` as-is without any additional processing.
   *
   * Set this option to true if you exclusively use explicit-ids in your project.
   *
   * https://lingui.dev/tutorials/explicit-vs-generated-ids#using-custom-id
   *
   * @default false
   */
  explicitIdAsDefault?: boolean

  /**
   * Custom attributes to append to the PO file header
   *
   * @default {}
   */
  customHeaderAttributes?: { [key: string]: string }

  /**
   * Print values for unnamed placeholders as comments for each message.
   *
   * This can give more context to translators for better translations.
   *
   * By default first 3 placeholders are shown.
   *
   * Example:
   *
   * ```js
   * t`Hello ${user.name} ${value}`
   * ```
   *
   * This will be extracted as
   *
   * ```po
   * #. placeholder {0}: user.name
   * msgid "Hello {0} {value}"
   * ```
   *
   * @default true
   */
  printPlaceholdersInComments?: boolean | { limit?: number }

  /**
   * Maximum line width before folding long strings.
   *
   * When a string exceeds this length, it will be split across multiple lines.
   * Set to `0` to disable folding (strings will only break on actual newlines).
   *
   * @default 0
   */
  foldLength?: number

  /**
   * Use compact format for multiline strings.
   *
   * When `true` (default), multiline strings start with content on the first line:
   * ```po
   * msgid "First line\n"
   * "Second line"
   * ```
   *
   * When `false`, uses GNU gettext's traditional format with an empty first line:
   * ```po
   * msgid ""
   * "First line\n"
   * "Second line"
   * ```
   *
   * The compact format is recommended as it's compatible with translation
   * platforms that may strip empty first lines, avoiding unnecessary diffs.
   *
   * @default true
   */
  compactMultiline?: boolean
}

function isGeneratedId(id: string, message: MessageType): boolean {
  return id === generateMessageId(message.message!, message.context)
}

const MANAGED_HEADERS = [
  "POT-Creation-Date",
  "MIME-Version",
  "Content-Type",
  "Content-Transfer-Encoding",
  "X-Generator",
  "Language",
] as const

function getNewHeaders(
  language: string | undefined,
  customHeaderAttributes: PoFormatterOptions["customHeaderAttributes"],
): Partial<POHeaders> {
  const nextHeaders: Partial<POHeaders> = {}

  nextHeaders["POT-Creation-Date"] =
    customHeaderAttributes?.["POT-Creation-Date"] ??
    formatPotCreationDate(new Date())
  nextHeaders["MIME-Version"] = "1.0"
  nextHeaders["Content-Type"] = "text/plain; charset=utf-8"
  nextHeaders["Content-Transfer-Encoding"] = "8bit"
  nextHeaders["X-Generator"] = "@lingui/cli"

  if (language) {
    nextHeaders.Language = language
  }

  Object.entries(customHeaderAttributes ?? {}).forEach(([key, value]) => {
    nextHeaders[key] = value
  })

  return nextHeaders
}

function getExistingHeaders(
  existingHeaders: Partial<POHeaders>,
  existingHeaderOrder: string[],
  customHeaderAttributes: PoFormatterOptions["customHeaderAttributes"],
): Partial<POHeaders> {
  // pofile-ts pre-fills `headers` with its own default template (all
  // standard gettext keys set to ""), even for keys the source file never
  // wrote. `headerOrder` only records keys actually found in the text, so
  // copy only those headers when serializing an existing file.
  const nextHeaders: Partial<POHeaders> = {}

  existingHeaderOrder.forEach((key) => {
    if (key in existingHeaders) {
      nextHeaders[key] = existingHeaders[key]
    }
  })

  // Explicit formatter configuration is still allowed to override existing
  // values or add new headers.
  Object.entries(customHeaderAttributes ?? {}).forEach(([key, value]) => {
    nextHeaders[key] = value
  })

  return nextHeaders
}

function getHeaderOrder(
  headers: Partial<POHeaders>,
  language: string | undefined,
  customHeaderAttributes: PoFormatterOptions["customHeaderAttributes"],
) {
  const managedOrder = [
    "POT-Creation-Date",
    "MIME-Version",
    "Content-Type",
    "Content-Transfer-Encoding",
    "X-Generator",
    ...(language ? ["Language"] : []),
    ...Object.keys(customHeaderAttributes ?? {}).filter(
      (key) =>
        !MANAGED_HEADERS.includes(key as (typeof MANAGED_HEADERS)[number]),
    ),
  ]

  const order = new Set(managedOrder)

  Object.keys(headers).forEach((key) => {
    order.add(key)
  })

  return [...order]
}

function getExistingHeaderOrder(
  headers: Partial<POHeaders>,
  existingHeaderOrder: string[],
) {
  const order = new Set(existingHeaderOrder.filter((key) => key in headers))

  Object.keys(headers).forEach((key) => {
    order.add(key)
  })

  return [...order]
}

function parsePoItemsInSourceOrder(content: string): PoItem[] {
  const lines = content.split(/\r?\n/)
  const messageStart = /^(?:#~\s*)?msgid(?:\s|$)/
  const contextStart = /^(?:#~\s*)?msgctxt(?:\s|$)/
  const itemStarts: number[] = []
  let pendingContextStart: number | undefined

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim()

    if (contextStart.test(line)) {
      pendingContextStart = index
      return
    }

    if (messageStart.test(line)) {
      itemStarts.push(pendingContextStart ?? index)
      pendingContextStart = undefined
    }
  })

  return itemStarts.flatMap((start, index) => {
    const end = itemStarts[index + 1] ?? lines.length
    return parsePo(lines.slice(start, end).join("\n")).items
  })
}

/** Parse a PO file while preserving obsolete markers that pofile-ts can lose. */
export function parsePoFile(content: string): PoFile {
  const po = parsePo(content)

  // Workaround for pofile-ts#22; the upstream fix is pending in pofile-ts#23:
  // https://github.com/sebastian-software/pofile-ts/issues/22
  // https://github.com/sebastian-software/pofile-ts/pull/23
  // Parse each item separately so the obsolete marker is counted from a fresh
  // parser state, then apply those markers to the full parse by source order.
  const sourceItems = parsePoItemsInSourceOrder(content)

  po.items.forEach((item, index) => {
    const sourceItem = sourceItems[index]
    if (sourceItem) {
      item.obsolete = sourceItem.obsolete
    }
  })

  return po
}

const EXPLICIT_ID_FLAG = "js-lingui-explicit-id"
const GENERATED_ID_FLAG = "js-lingui-generated-id"

const serialize = (
  catalog: CatalogType,
  options: PoFormatterOptions,
  ctx: { locale: string | undefined; sourceLocale: string },
) => {
  return Object.keys(catalog).map((id) => {
    const message: MessageType<POCatalogExtra> = catalog[id]

    const item = createItem()

    // The extractedComments array may be modified in this method,
    // so create a new array with the message's elements.
    item.extractedComments = [
      ...(message.comments?.length
        ? splitMultiLineComments(message.comments)
        : []),
    ]

    item.flags = ((message.extra?.flags || []) as string[]).reduce<
      Record<string, boolean>
    >((acc, flag) => {
      acc[flag] = true
      return acc
    }, {})

    const _isGeneratedId = isGeneratedId(id, message)

    if (_isGeneratedId) {
      item.msgid = message.message!

      if (options.explicitIdAsDefault) {
        if (!item.extractedComments.includes(GENERATED_ID_FLAG)) {
          item.extractedComments.push(GENERATED_ID_FLAG)
        }
      }

      if (options.printLinguiId) {
        if (!item.extractedComments.find((c) => c.includes("js-lingui-id"))) {
          item.extractedComments.push(`js-lingui-id: ${id}`)
        }
      }
    } else {
      if (!options.explicitIdAsDefault) {
        if (!item.extractedComments.includes(EXPLICIT_ID_FLAG)) {
          item.extractedComments.push(EXPLICIT_ID_FLAG)
        }
      }

      item.msgid = id
    }

    if (options.printPlaceholdersInComments !== false && message.placeholders) {
      item.extractedComments = item.extractedComments.filter(
        (comment) => !comment.startsWith("placeholder "),
      )

      const limit =
        typeof options.printPlaceholdersInComments === "object" &&
        options.printPlaceholdersInComments.limit
          ? options.printPlaceholdersInComments.limit
          : 3

      if (message.placeholders) {
        Object.entries(message.placeholders).forEach(([name, value]) => {
          if (/^\d+$/.test(name)) {
            value.slice(0, limit).forEach((entry) => {
              item.extractedComments.push(
                `placeholder {${name}}: ${normalizePlaceholderValue(entry)}`,
              )
            })
          }
        })
      }
    }

    if (message.context) {
      item.msgctxt = message.context
    }

    if (!_isGeneratedId && (ctx.locale === ctx.sourceLocale || !ctx.locale)) {
      // in source lang catalog if message has explicit id, put a source message as translation
      // Otherwise, source message would be completely lost
      //   #. js-lingui-explicit-id
      //   msgid "custom.id"
      //   msgstr "with explicit id"
      item.msgstr = [message.translation || message.message!]
    } else {
      item.msgstr = [message.translation!]
    }

    item.comments = message.extra?.translatorComments || []

    if (options.origins !== false) {
      if (message.origin && options.lineNumbers === false) {
        item.references = [...new Set(message.origin.map(([path]) => path))]
      } else {
        item.references = message.origin ? message.origin.map(joinOrigin) : []
      }
    }
    item.obsolete = message.obsolete || false

    return item
  })
}

function deserialize(
  items: PoItem[],
  options: PoFormatterOptions,
): CatalogType {
  return items.reduce<CatalogType<POCatalogExtra>>((catalog, item) => {
    const comments = item.extractedComments

    const message: MessageType<POCatalogExtra> = {
      translation: item.msgstr[0],
      comments: comments.filter(
        // drop flags from comments
        (c) => c !== GENERATED_ID_FLAG && c !== EXPLICIT_ID_FLAG,
      ),
      context: item.msgctxt ?? undefined,
      obsolete: item.flags.obsolete || item.obsolete,
      origin: (item.references || []).map((ref) => splitOrigin(ref)),
      extra: {
        translatorComments: item.comments || [],
        flags: Object.keys(item.flags).map((flag) => flag.trim()),
      },
    }

    let id = item.msgid

    // if generated id, recreate it
    if (
      options.explicitIdAsDefault
        ? comments.includes(GENERATED_ID_FLAG)
        : !comments.includes(EXPLICIT_ID_FLAG)
    ) {
      id = generateMessageId(item.msgid, item.msgctxt as string)
      message.message = item.msgid
    }

    const existingMessage = catalog[id]
    if (
      existingMessage === undefined ||
      !message.obsolete ||
      existingMessage.obsolete
    ) {
      catalog[id] = message
    }
    return catalog
  }, {})
}

export function formatter(options: PoFormatterOptions = {}): CatalogFormatter {
  options = {
    origins: true,
    lineNumbers: true,
    foldLength: 0,
    ...options,
  }

  return {
    catalogExtension: ".po",
    templateExtension: ".pot",

    parse(content): CatalogType {
      const po = parsePoFile(content)
      return deserialize(po.items, options)
    },

    serialize(catalog, ctx): string {
      const existingPo =
        ctx.existing !== undefined && ctx.existing !== ""
          ? parsePoFile(ctx.existing)
          : undefined
      const po: PoFile = createPoFile()

      po.comments = [...(existingPo?.comments ?? [])]
      po.extractedComments = [...(existingPo?.extractedComments ?? [])]
      po.headers = existingPo
        ? getExistingHeaders(
            existingPo.headers,
            existingPo.headerOrder,
            options.customHeaderAttributes,
          )
        : getNewHeaders(ctx.locale, options.customHeaderAttributes)
      po.headerOrder = existingPo
        ? getExistingHeaderOrder(po.headers, existingPo.headerOrder)
        : getHeaderOrder(po.headers, ctx.locale, options.customHeaderAttributes)

      po.items = serialize(catalog, options, {
        locale: ctx.locale,
        sourceLocale: ctx.sourceLocale,
      })

      const serializeOptions: SerializeOptions = {}
      if (options.foldLength !== undefined) {
        serializeOptions.foldLength = options.foldLength
      }
      if (options.compactMultiline !== undefined) {
        serializeOptions.compactMultiline = options.compactMultiline
      }

      return stringifyPo(po, serializeOptions)
    },
  }
}

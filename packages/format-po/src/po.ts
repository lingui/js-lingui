import { format as formatDate } from "date-fns"
import PO from "pofile"

import { CatalogFormatter, CatalogType, MessageType } from "@lingui/conf"
import { generateMessageId } from "@lingui/message-utils/generateMessageId"
import { normalizePlaceholderValue } from "./utils"

type POItem = InstanceType<typeof PO.Item>

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
      : comment
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
}

function isGeneratedId(id: string, message: MessageType): boolean {
  return id === generateMessageId(message.message, message.context)
}

function getCreateHeaders(
  language: string,
  customHeaderAttributes: PoFormatterOptions["customHeaderAttributes"]
): PO["headers"] {
  return {
    "POT-Creation-Date": formatDate(new Date(), "yyyy-MM-dd HH:mmxxxx"),
    "MIME-Version": "1.0",
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Transfer-Encoding": "8bit",
    "X-Generator": "@lingui/cli",
    ...(language ? { Language: language } : {}),
    ...(customHeaderAttributes ?? {}),
  }
}

const EXPLICIT_ID_FLAG = "js-lingui-explicit-id"
const GENERATED_ID_FLAG = "js-lingui-generated-id"

const serialize = (
  catalog: CatalogType,
  options: PoFormatterOptions,
  ctx: { locale: string | null; sourceLocale: string }
) => {
  return Object.keys(catalog).map((id) => {
    const message: MessageType<POCatalogExtra> = catalog[id]

    const item = new PO.Item()

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
      item.msgid = message.message

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

    if (options.printPlaceholdersInComments !== false) {
      item.extractedComments = item.extractedComments.filter(
        (comment) => !comment.startsWith("placeholder ")
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
                `placeholder {${name}}: ${normalizePlaceholderValue(entry)}`
              )
            })
          }
        })
      }
    }

    if (message.context) {
      item.msgctxt = message.context
    }

    if (
      !_isGeneratedId &&
      (ctx.locale === ctx.sourceLocale || ctx.locale === null)
    ) {
      // in source lang catalog if message has explicit id, put a source message as translation
      // Otherwise, source message would be completely lost
      //   #. js-lingui-explicit-id
      //   msgid "custom.id"
      //   msgstr "with explicit id"
      item.msgstr = [message.translation || message.message]
    } else {
      item.msgstr = [message.translation]
    }

    item.comments = message.extra?.translatorComments || []

    if (options.origins !== false) {
      if (message.origin && options.lineNumbers === false) {
        item.references = message.origin.map(([path]) => path)
      } else {
        item.references = message.origin ? message.origin.map(joinOrigin) : []
      }
    }
    item.obsolete = message.obsolete

    return item
  })
}

function deserialize(
  items: POItem[],
  options: PoFormatterOptions
): CatalogType {
  return items.reduce<CatalogType<POCatalogExtra>>((catalog, item) => {
    const comments = item.extractedComments

    const message: MessageType<POCatalogExtra> = {
      translation: item.msgstr[0],
      comments: comments.filter(
        // drop flags from comments
        (c) => c !== GENERATED_ID_FLAG && c !== EXPLICIT_ID_FLAG
      ),
      context: item.msgctxt ?? null,
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
      id = generateMessageId(item.msgid, item.msgctxt)
      message.message = item.msgid
    }

    catalog[id] = message
    return catalog
  }, {})
}

export function formatter(options: PoFormatterOptions = {}): CatalogFormatter {
  options = {
    origins: true,
    lineNumbers: true,
    ...options,
  }

  return {
    catalogExtension: ".po",
    templateExtension: ".pot",

    parse(content): CatalogType {
      const po = PO.parse(content)
      return deserialize(po.items, options)
    },

    serialize(catalog, ctx): string {
      let po: PO

      if (ctx.existing) {
        po = PO.parse(ctx.existing)
      } else {
        po = new PO()
        po.headers = getCreateHeaders(
          ctx.locale,
          options.customHeaderAttributes
        )
        // accessing private property
        ;(po as any).headerOrder = Object.keys(po.headers)
      }

      po.items = serialize(catalog, options, {
        locale: ctx.locale,
        sourceLocale: ctx.sourceLocale,
      })
      return po.toString()
    },
  }
}

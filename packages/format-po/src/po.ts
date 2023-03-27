import { format as formatDate } from "date-fns"
import PO from "pofile"

import { CatalogFormatter, CatalogType, MessageType } from "@lingui/conf"
import { generateMessageId } from "@lingui/message-utils"

type POItem = InstanceType<typeof PO.Item>

const splitOrigin = (origin: string) => {
  const [file, line] = origin.split(":")
  return [file, line ? Number(line) : null] as [file: string, line: number]
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
}

function isGeneratedId(id: string, message: MessageType): boolean {
  return id === generateMessageId(message.message, message.context)
}

function getCreateHeaders(language: string): PO["headers"] {
  return {
    "POT-Creation-Date": formatDate(new Date(), "yyyy-MM-dd HH:mmxxxx"),
    "MIME-Version": "1.0",
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Transfer-Encoding": "8bit",
    "X-Generator": "@lingui/cli",
    ...(language ? { Language: language } : {}),
  }
}

const EXPLICIT_ID_FLAG = "explicit-id"

const serialize = (catalog: CatalogType, options: PoFormatterOptions) => {
  return Object.keys(catalog).map((id) => {
    const message: MessageType<POCatalogExtra> = catalog[id]

    const item = new PO.Item()

    // The extractedComments array may be modified in this method,
    // so create a new array with the message's elements.
    item.extractedComments = [...(message.comments || [])]

    item.flags = ((message.extra?.flags || []) as string[]).reduce<
      Record<string, boolean>
    >((acc, flag) => {
      acc[flag] = true
      return acc
    }, {})

    const _isGeneratedId = isGeneratedId(id, message)

    if (_isGeneratedId) {
      item.msgid = message.message

      if (options.printLinguiId) {
        if (!item.extractedComments.find((c) => c.includes("js-lingui-id"))) {
          item.extractedComments.push(`js-lingui-id: ${id}`)
        }
      }
    } else {
      item.flags[EXPLICIT_ID_FLAG] = true
      item.msgid = id
    }

    if (message.context) {
      item.msgctxt = message.context
    }

    item.msgstr = [message.translation]
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

function deserialize(items: POItem[]): CatalogType {
  return items.reduce<CatalogType<POCatalogExtra>>((catalog, item) => {
    const message: MessageType<POCatalogExtra> = {
      translation: item.msgstr[0],
      comments: item.extractedComments || [],
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
    if (!item.flags[EXPLICIT_ID_FLAG]) {
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
      return deserialize(po.items)
    },

    serialize(catalog, ctx): string {
      let po: PO

      if (ctx.existing) {
        po = PO.parse(ctx.existing)
      } else {
        po = new PO()
        po.headers = getCreateHeaders(ctx.locale)
        // accessing private property
        ;(po as any).headerOrder = Object.keys(po.headers)
      }

      po.items = serialize(catalog, options)
      return po.toString()
    },
  }
}

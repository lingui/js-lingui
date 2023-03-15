import { format as formatDate } from "date-fns"
import PO from "pofile"

import { joinOrigin, splitOrigin } from "../utils"
import { CatalogType, MessageType } from "../types"
import { CatalogFormatter } from "@lingui/conf"
import { generateMessageId } from "../generateMessageId"

type POItem = InstanceType<typeof PO.Item>

export type PoFormatterOptions = {
  origins?: boolean
  lineNumbers?: boolean
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

export const serialize = (
  catalog: CatalogType,
  options: PoFormatterOptions,
  postProcessItem?: (
    item: POItem,
    message: MessageType,
    id: string,
    isGeneratedId: boolean
  ) => POItem
) => {
  return Object.keys(catalog).map((id) => {
    const message = catalog[id]

    const item = new PO.Item()

    // The extractedComments array may be modified in this method,
    // so create a new array with the message's elements.
    item.extractedComments = [...(message.extractedComments || [])]

    item.flags = (message.flags || []).reduce<Record<string, boolean>>(
      (acc, flag) => {
        acc[flag] = true
        return acc
      },
      {}
    )

    const _isGeneratedId = isGeneratedId(id, message)

    if (_isGeneratedId) {
      item.msgid = message.message
      if (!item.extractedComments.find((c) => c.includes("js-lingui-id"))) {
        item.extractedComments.push(`js-lingui-id: ${id}`)
      }
    } else {
      item.flags[EXPLICIT_ID_FLAG] = true
      item.msgid = id
    }

    if (message.context) {
      item.msgctxt = message.context
    }

    item.msgstr = [message.translation]
    item.comments = message.comments || []

    if (options.origins !== false) {
      if (message.origin && options.lineNumbers === false) {
        item.references = message.origin.map(([path]) => path)
      } else {
        item.references = message.origin ? message.origin.map(joinOrigin) : []
      }
    }
    item.obsolete = message.obsolete

    return postProcessItem
      ? postProcessItem(item, message, id, _isGeneratedId)
      : item
  })
}

export function deserialize(
  items: POItem[],
  onItem: (item: POItem) => void
): CatalogType {
  return items.reduce<CatalogType>((catalog, item) => {
    onItem(item)

    const message: MessageType = {
      translation: item.msgstr[0],
      extractedComments: item.extractedComments || [],
      comments: item.comments || [],
      context: item.msgctxt ?? null,
      obsolete: item.flags.obsolete || item.obsolete,
      origin: (item.references || []).map((ref) => splitOrigin(ref)),
      flags: Object.keys(item.flags).map((flag) => flag.trim()),
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

function validateItem(item: POItem): void {
  if (item.msgstr.length > 1) {
    console.warn(
      `Multiple translations for item with key ${item.msgid} is not supported and it will be ignored.`
    )
  }
}

export default function (options: PoFormatterOptions = {}) {
  options = {
    origins: true,
    lineNumbers: true,
    ...options,
  }

  return {
    catalogExtension: ".po",
    templateExtension: ".pot",

    parse(content: string): CatalogType {
      const po = PO.parse(content)
      return deserialize(po.items, validateItem)
    },

    serialize(
      catalog: CatalogType,
      ctx: { locale: string; existing: string }
    ): string {
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
  } satisfies CatalogFormatter
}

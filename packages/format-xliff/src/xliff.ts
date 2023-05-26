import xmlJs from "xml-js"

import {
  CatalogFormatter,
  CatalogType,
  MessageOrigin,
  MessageType,
} from "@lingui/conf"

// const splitOrigin = (origin: string) => {
//   const [file, line] = origin.split(":")
//   return [file, line ? Number(line) : null] as [file: string, line: number]
// }
//
// const joinOrigin = (origin: [file: string, line?: number]): string =>
//   origin.join(":")

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
}

// todo
// function deserialize(items: POItem[]): CatalogType {
//   return items.reduce<CatalogType>((catalog, item) => {
//     const message: MessageType = {
//       translation: item.msgstr[0],
//       extractedComments: item.extractedComments || [],
//       comments: item.comments || [],
//       context: item.msgctxt ?? null,
//       obsolete: item.flags.obsolete || item.obsolete,
//       origin: (item.references || []).map((ref) => splitOrigin(ref)),
//       flags: Object.keys(item.flags).map((flag) => flag.trim()),
//     }
//
//     let id = item.msgid
//
//     // if generated id, recreate it
//     if (!item.flags[EXPLICIT_ID_FLAG]) {
//       id = generateMessageId(item.msgid, item.msgctxt)
//       message.message = item.msgid
//     }
//
//     catalog[id] = message
//     return catalog
//   }, {})
// }

export function formatter(options: PoFormatterOptions = {}) {
  options = {
    origins: true,
    lineNumbers: true,
    ...options,
  }

  return {
    catalogExtension: ".po",
    templateExtension: ".pot",

    parse(content: string): CatalogType {
      // todo
      return {}
      // const po = PO.parse(content)
      // return deserialize(po.items)
    },

    serialize(
      catalog: CatalogType,
      ctx: { locale: string; existing: string }
    ): string {
      const units = Object.keys(catalog).map((id) => {
        return createTransUnit(id, catalog[id])
      })

      const data = createBody("en", ctx.locale, units)
      return xmlJs.js2xml(data, {
        spaces: 2,
      })
    },
  } satisfies CatalogFormatter
}

function createNote(meaning: string, from: string) {
  return {
    type: "element",
    name: "note",
    attributes: { priority: "1", from },
    elements: [{ type: "text", text: meaning }],
  }
}

function createBody(
  sourceLang: string,
  targetLang: string,
  transUnits: any[]
): xmlJs.Element {
  return {
    declaration: { attributes: { version: "1.0", encoding: "UTF-8" } },
    elements: [
      {
        type: "element",
        name: "xliff",
        attributes: {
          xmlns: "urn:oasis:names:tc:xliff:document:1.2",
          version: "1.2",
        },
        elements: [
          {
            type: "element",
            name: "file",
            attributes: {
              "source-language": sourceLang,
              datatype: "plaintext",
              original: "js-lingui",
              "target-language": targetLang,
            },
            elements: [
              {
                type: "element",
                name: "body",
                elements: transUnits,
              },
            ],
          },
        ],
      },
    ],
  }
}

function createOrigin([filename, line]: MessageOrigin) {
  return {
    type: "element",
    name: "context-group",
    attributes: { purpose: "location" },
    elements: [
      {
        type: "element",
        name: "context",
        attributes: { "context-type": "sourcefile" },
        elements: [
          {
            type: "text",
            text: filename,
          },
        ],
      },
      {
        type: "element",
        name: "context",
        attributes: { "context-type": "linenumber" },
        elements: [{ type: "text", text: line.toString() }],
      },
    ],
  }
}

function createElement(name: string, content: string): xmlJs.Element {
  return {
    type: "element",
    name: name,
    elements: [{ type: "cdata", cdata: content }],
  }
}

function createTransUnit(id: string, message: MessageType) {
  return {
    type: "element",
    name: "trans-unit",
    attributes: {
      id: id,
      datatype: "html",
    },
    elements: [
      ...(message.message ? [createElement("source", message.message)] : []),
      ...(message.translation
        ? [createElement("target", message.translation)]
        : []),
      ...(message.context ? [createNote(message.context, "context")] : []),
      ...(message.comments || []).map((c) => createNote(c, "comment")),
      ...(message.origin || []).map((o) => createOrigin(o)),
    ],
  }
}

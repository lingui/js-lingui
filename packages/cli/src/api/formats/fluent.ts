import fs from "fs"
import { parse, serializeExpression } from "fluent-syntax"

import { MessageType } from "../types"
import { joinOrigin, splitOrigin } from "../utils"

// Most methods was adopted from
// https://github.com/projectfluent/fluent.js/blob/master/fluent-syntax/src/serializer.js

const PREFIX_COMMENTS = "#."
const PREFIX_ORIGIN = "#:"
const PREFIX_FLAGS = "#,"
const PREFIX_OBSOLETE = "#~"

function indent(content, ind = "    ") {
  return content.split("\n").join(`\n${ind}`)
}

function serializePattern(content) {
  const startOnNewLine = content.indexOf("\n") >= 0
  if (startOnNewLine) {
    return `\n    ${indent(content, "    ")}`
  }
  return ` ${content}`
}

function serializeComment(comment, prefix = "#") {
  const prefixed = comment
    .split("\n")
    .map(line => (line.length ? `${prefix} ${line}` : prefix))
    .join("\n")
  // Add the trailing newline.
  return `${prefixed}\n`
}

/**
 * Fluent format can be found here:
 * https://github.com/projectfluent/fluent/blob/master/spec/fluent.ebnf
 */
function serializeMessage(message, key) {
  if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(key)) {
    console.warn(
      `Fluent Message with wrong key '${key}' was skipped. Valid key mask is /^[a-zA-Z][a-zA-Z0-9_-]*$/`
    )
    return ""
  }

  const parts = []

  if (message.comment) {
    parts.push(serializeComment(message.comment, "#"))
  }

  if (message.comments) {
    message.comments.forEach(o => {
      // Fluent 1.0 does not support translater comments
      // Differs from po file! Cause by Fluent spec `description` should be as regular comment.
      parts.push(serializeComment(o, `# ${PREFIX_COMMENTS}`))
    })
  }

  if (message.origin) {
    message.origin.forEach(o => {
      // Fluent 1.0 does not support sources
      parts.push(serializeComment(joinOrigin(o), `# ${PREFIX_ORIGIN}`))
    })
  }

  if (message.flags && message.flags.length > 0) {
    // Fluent 1.0 does not support flags
    // So as fallback use `#,` comment like in po files
    parts.push(serializeComment(message.flags.join(","), `# ${PREFIX_FLAGS}`))
  }

  parts.push(`${key} =`)

  if (message.translation) {
    parts.push(serializePattern(message.translation))
  }

  if (message.obsolete) {
    // Comment obsolete messages like in po files
    return serializeComment(parts.join(""), `# ${PREFIX_OBSOLETE}`)
  }

  parts.push("\n")
  return parts.join("")
}

function serialize(catalog) {
  return Object.keys(catalog)
    .map(key => serializeMessage(catalog[key], key))
    .join("\n")
}

function deserializeElementAst(element) {
  switch (element.type) {
    case "TextElement":
      return element.value
    case "Placeable":
      return deserializePlaceableAST(element)
  }
}

function deserializePlaceableAST(placeable) {
  const expr = placeable.expression
  switch (expr.type) {
    case "Placeable":
      return `{${deserializePlaceableAST(expr)}}`
    case "SelectExpression":
      // Special-case select expression to control the whitespace around the
      // opening and the closing brace.
      return `{ ${serializeExpression(expr)}}`
    default:
      return `{ ${serializeExpression(expr)} }`
  }
}

function deserializeMessagePatternAST(value) {
  return value.elements.map(deserializeElementAst).join("\n")
}

function deserializeMessageAST(entry) {
  const key = entry && entry.id ? entry.id.name : null
  if (!key) return

  const message: MessageType = {
    translation: deserializeMessagePatternAST(entry.value), // string,
    origin: [], // Array<[number, string]>,
    comment: undefined, // ?string,
    comments: undefined,
    obsolete: false, // boolean,
    flags: undefined // ?Array<string>
  }

  if (entry.comment && entry.comment.content) {
    const rawComment = entry.comment.content
    const lines = rawComment.split("\n")
    lines.forEach(line => {
      if (line.startsWith(PREFIX_COMMENTS)) {
        if (!message.comments) message.comments = []
        message.comments.push(line.substr(PREFIX_COMMENTS.length + 1))
      } else if (line.startsWith(PREFIX_ORIGIN)) {
        if (!message.origin) message.origin = []
        message.origin.push(splitOrigin(line.substr(PREFIX_ORIGIN.length + 1)))
      } else if (line.startsWith(PREFIX_FLAGS)) {
        if (!message.flags) message.flags = []
        message.flags.push(...line.substr(PREFIX_FLAGS.length + 1).split(","))
      } else {
        if (!message.comment) {
          message.comment = line
        } else {
          message.comment += `\n${line}`
        }
      }
    })
  }

  return [key, message]
}

function deserializeCommentAST(entry) {
  const content = entry.content

  let obsoleteFLT = []
  const lines = content.split("\n")
  lines.forEach(line => {
    if (line.startsWith(PREFIX_OBSOLETE)) {
      obsoleteFLT.push(line.substr(PREFIX_OBSOLETE.length + 1))
    }
  })

  if (obsoleteFLT.length > 0) {
    const flt = obsoleteFLT.join("\n")
    const ast = parse(flt)
    if (ast && ast.body && ast.body[0]) {
      const data = deserializeEntry(ast.body[0])
      if (data && data[1]) data[1].obsolete = true
      return data
    }
  }
}

function deserializeEntry(entry) {
  switch (entry.type) {
    case "Message":
      return deserializeMessageAST(entry)
    case "Comment":
      return deserializeCommentAST(entry)
    // case "Term": // -term
    // case "GroupComment": // ##
    // case "ResourceComment": // ###
    // case "Junk": // something wrong
  }
}

function deserialize(raw: string) {
  const ast = parse(raw)

  if (ast.type !== "Resource") {
    console.error(
      `Fluent format parser error - Unknown resource type: ${ast.type}`
    )
  }

  const catalog = {}
  for (const entry of ast.body) {
    const data = deserializeEntry(entry)
    if (data) {
      const [key, message] = data
      if (key) catalog[key] = message
    }
  }

  return catalog
}

export default {
  catalogExtension: ".flt",

  write(filename, catalog) {
    fs.writeFileSync(filename, serialize(catalog))
  },

  read(filename) {
    try {
      const raw = fs.readFileSync(filename).toString()
      return deserialize(raw)
    } catch (e) {
      console.error(`Cannot read ${filename}: ${e.message}`)
      return {}
    }
  }
}

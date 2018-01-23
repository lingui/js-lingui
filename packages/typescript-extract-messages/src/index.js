import fs from "fs"
import fsPath from "path"
import mkdirp from "mkdirp"
import { getConfig } from "@lingui/conf"
import * as ts from "typescript"

function addMessage(node, messages, id, defaults) {
  const file = node.getSourceFile()
  const pos = file.getLineAndCharacterOfPosition(node.getStart())
  const origin = [file.fileName, pos.line]

  const message = messages.get(id)
  if (message !== undefined) {
    // only set/check default language when it's defined.
    if (message.defaults && defaults && message.defaults !== defaults) {
      throw new Error("Different defaults for the same message ID.")
    } else {
      if (defaults) {
        message.defaults = defaults
      }

      message.origin.push(origin)
    }
  } else {
    messages.set(id, { defaults, origin: [origin] })
  }
}

function extract(sourceFile) {
  const messages = new Map()
  parseNode(sourceFile)
  return messages

  function parseNode(node) {
    if (ts.isJsxSelfClosingElement(node)) {
      if (node.tagName.getText() === "Trans") {
        parseTrans(node)
      }
    } else if (ts.isCallExpression(node)) {
      if (node.expression.getText() === "i18n._") {
        parseUnderscore(node)
      }
    }
    ts.forEachChild(node, parseNode)
  }

  function parseTrans(node) {
    let id
    let defaults

    const properties = node.attributes.properties
    for (const prop of properties) {
      if (!ts.isJsxAttribute(prop)) {
        continue
      }
      if (prop.name.text === "id") {
        // if (!prop.initializer || !ts.isStringLiteral(prop.initializer)) {
        //   throw new Error("Invalid translation id")
        // }
        id = prop.initializer.text
      }
      if (prop.name.text === "defaults") {
        // if (!prop.initializer || !ts.isStringLiteral(prop.initializer)) {
        //   throw new Error("Invalid translation defaults")
        // }
        defaults = prop.initializer.text
      }
    }

    if (
      id === null &&
      properties.find(props => props.name.text === "id") === null
    ) {
      console.warn("Missing message ID, skipping.")
    }

    addMessage(node, messages, id, defaults)
  }

  function parseUnderscore(node) {
    let defaults

    if (node.arguments.length === 0 || !ts.isStringLiteral(node.arguments[0])) {
      throw new Error("Missing id")
    }

    const id = node.arguments[0].text

    if (
      node.arguments.length === 3 &&
      ts.isObjectLiteralExpression(node.arguments[2])
    ) {
      const obj = node.arguments[2]
      for (const prop of obj.properties) {
        if (!ts.isPropertyAssignment(prop)) {
          continue
        }
        if (prop.name.text === "defaults") {
          if (!prop.initializer || !ts.isStringLiteral(prop.initializer)) {
            throw new Error("Invalid translation defaults")
          }
          defaults = prop.initializer.text
        }
      }
    }

    addMessage(node, messages, id, defaults)
  }
}

export default function(fileName, options = {}) {
  const opts = getConfig()
  const optsBaseDir = opts.rootDir
  const localeDir = options.localeDir || opts.localeDir

  // localTransComponentName = null
  const visited = new WeakSet()

  const file = fs.readFileSync(fileName)
  const sourceFile = ts.createSourceFile(
    fileName,
    file.toString(),
    ts.ScriptTarget.ES2015,
    true
  )

  /* Write catalog to directory `localeDir`/_build/`path.to.file`/`filename`.json
   * e.g: if file is src/components/App.js (relative to package.json), then
   * catalog will be in locale/_build/src/components/App.json
   */
  const baseDir = fsPath.dirname(fsPath.relative(optsBaseDir, fileName))
  const targetDir = fsPath.join(localeDir, "_build", baseDir)

  const messages = extract(sourceFile)

  // no messages, skip file
  if (!messages.size) return

  const catalog = {}
  messages.forEach((value, key) => {
    catalog[key] = value
  })

  mkdirp.sync(targetDir)
  const [basename] = fsPath.basename(fileName).split(".", 2)

  fs.writeFileSync(
    fsPath.join(targetDir, `${basename}.json`),
    JSON.stringify(catalog, null, 2)
  )
}

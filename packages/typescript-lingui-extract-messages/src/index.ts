import { readFileSync } from 'fs'
import * as ts from "typescript"

interface Message {
  defaults?: string,
  origin: any[][]
}

export function extract (fileName: string) {
  const messages: Map<string, Message> = new Map()
  const file = readFileSync(fileName)
  const sourceFile = ts.createSourceFile(fileName, file.toString(), ts.ScriptTarget.ES2015, true)
  parseNode(sourceFile)

  function parseNode (node: ts.Node) {
    if (ts.isJsxSelfClosingElement(node)) {
      if (node.tagName.getText() === 'Trans') {
        parseTrans(node)
      }
    } else if (ts.isTaggedTemplateExpression(node)) {
      if (node.tag.getText() === 'i18n.t') {
        parseTemplate(node)
      }
    } else if (ts.isCallExpression(node)) {
      if (node.expression.getText() === 'i18n._') {
        parseUnderscore(node)
      }
    }
    ts.forEachChild(node, parseNode)
  }

  function parseTrans (node: ts.JsxSelfClosingElement) {
    const properties = node.attributes.properties
    let id: string | null = null
    let defaults = undefined
    for (const prop of properties) {
      if (!ts.isJsxAttribute(prop)) {
        continue
      }
      if (prop.name.text === 'id') {
        if (!prop.initializer || !ts.isStringLiteral(prop.initializer)) {
          throw new Error('Invalid translation id')
        }
        id = prop.initializer.text
      }
      if (prop.name.text === 'defaults') {
        if (!prop.initializer || !ts.isStringLiteral(prop.initializer)) {
          throw new Error('Invalid translation defaults')
        }
        defaults = prop.initializer.text
      }
    }
    if (id == null) {
      throw new Error('Missing id')
    }
    addMessage(node, id, defaults)
  }

  function parseTemplate (node: ts.TaggedTemplateExpression) {
    const text = node.template.getText()
    const id = text.slice(1, text.length - 1)
    addMessage(node, id)
  }

  function parseUnderscore (node: ts.CallExpression) {
    let defaults = undefined
    if (node.arguments.length === 0 || !ts.isStringLiteral(node.arguments[0])) {
      throw new Error('Missing id')
    }
    const id = (node.arguments[0] as ts.StringLiteral).text
    if (node.arguments.length === 2 && ts.isObjectLiteralExpression(node.arguments[1])) {
      const obj = node.arguments[1] as ts.ObjectLiteralExpression
      for (const prop of obj.properties) {
        if (!ts.isPropertyAssignment(prop)) {
          continue
        }
        if ((prop.name as ts.Identifier).text === 'defaults') {
          if (!prop.initializer || !ts.isStringLiteral(prop.initializer)) {
            throw new Error('Invalid translation defaults')
          }
          defaults = prop.initializer.text
        }
      }
    }
    addMessage(node, id, defaults)
  }

  function addMessage (node: ts.Node, id: string, defaults?: string) {
    const file = node.getSourceFile()
    const pos = file.getLineAndCharacterOfPosition(node.getStart())
    const loc = [
      file.fileName,
      pos.line
    ]
    const existingMessage = messages.get(id)
    if (existingMessage == undefined) {
      messages.set(id, {
        origin: [loc],
        defaults
      })
    } else {
      if (existingMessage.defaults !== defaults) {
        throw new Error('Different defaults for same message id')
      }
      existingMessage.origin.push(loc)
    }
  }

  return messages
}

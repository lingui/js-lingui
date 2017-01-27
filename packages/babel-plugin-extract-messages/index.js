import fs from 'fs'
import fsPath from 'path'

const MESSAGES  = Symbol('I18nMessages')

function addMessage(path, messages, attrs) {
  const { id } = attrs
  delete attrs.id

  if (messages.has(id)) {
    const message = messages.get(id)
    if (message.defaults !== attrs.defaults) {
      throw path.buildCodeFrameError("Different defaults for the same message ID.")
    } else {
      message.context = message.context.concat(attrs.context)
    }
  } else {
    messages.set(id, attrs)
  }
}

export default function({ types: t }) {
  function isTransComponent(node) {
    return t.isJSXElement(node) && t.isJSXIdentifier(node.openingElement.name, { name: 'Trans' })
  }

  return {
    visitor: {
      JSXElement(path, { file }) {
        const { node } = path

        if (!isTransComponent(node)) return

        const messages = file.get(MESSAGES)

        const attrs = node.openingElement.attributes.reduce((acc, item) => {
          acc[item.name.name] = item.value.value
          return acc
        }, {})

        const filename = fsPath.relative(__dirname, file.opts.filename)
        const line = node.openingElement.loc.start.line
        attrs.context = [`${filename}:${line}`]

        addMessage(path, messages, attrs)
      }
    },

    pre(file) {
       if (!file.has(MESSAGES)) {
         file.set(MESSAGES, new Map())
       }
     },

    post(file) {
      const baseDir = this.opts.messagesDir
      const messages = {}

      file.get(MESSAGES).forEach((value, key) => {
        const { defaults = "" } = value
        delete value.defaults
        messages[key] = [defaults, value]
      })

      fs.writeFileSync(
        fsPath.join(baseDir, 'en.json'),
        JSON.stringify(messages, null, 2)
      )
    }
  }
}

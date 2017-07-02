import fs from 'fs'
import fsPath from 'path'
import mkdirp from 'mkdirp'
import getConfig from 'lingui-conf'

const MESSAGES = Symbol('I18nMessages')

function addMessage (path, messages, attrs) {
  const { id } = attrs
  delete attrs.id

  if (messages.has(id)) {
    const message = messages.get(id)
    if (message.defaults !== attrs.defaults) {
      throw path.buildCodeFrameError('Different defaults for the same message ID.')
    } else {
      [].push.apply(message.origin, attrs.origin)
    }
  } else {
    messages.set(id, attrs)
  }
}

export default function ({ types: t }) {
  const opts = getConfig()
  const optsBaseDir = opts.rootDir

  function isTransComponent (node) {
    return t.isJSXElement(node) && t.isJSXIdentifier(node.openingElement.name, { name: 'Trans' })
  }

  const isI18nMethod = node =>
    t.isMemberExpression(node) &&
    t.isIdentifier(node.object, { name: 'i18n' }) &&
    t.isIdentifier(node.property, { name: '_' })

  function collectMessage (path, file, attrs) {
    const messages = file.get(MESSAGES)

    const filename = fsPath.relative(optsBaseDir, file.opts.filename)
    const line = path.node.loc ? path.node.loc.start.line : null
    attrs.origin = [[filename, line]]

    addMessage(path, messages, attrs)
  }

  return {
    visitor: {
      JSXElement (path, { file }) {
        const { node } = path
        if (!isTransComponent(node)) return

        const attrs = node.openingElement.attributes.reduce((acc, item) => {
          const key = item.key ? item.key.name : item.name.name
          if (key === 'id' || key === 'defaults') acc[key] = item.value.value
          return acc
        }, {})

        collectMessage(path, file, attrs)
      },

      CallExpression (path, { file }) {
        const { node } = path
        if (!isI18nMethod(node.callee)) return

        const optional = node.arguments[1] && node.arguments[1].properties
          ? node.arguments[1].properties
          : []

        const attrs = optional.reduce((acc, item) => {
          const key = item.key ? item.key.name : item.name.name
          if (key === 'defaults') acc[key] = item.value.value
          return acc
        }, {
          id: node.arguments[0].value
        })

        collectMessage(path, file, attrs)
      }
    },

    pre (file) {
      // Ignore else path for now. Collision is possible if other plugin is
      // using the same Symbol('I18nMessages').
      // istanbul ignore else
      if (!file.has(MESSAGES)) {
        file.set(MESSAGES, new Map())
      }
    },

    post (file) {
      /* Write catalog to directory `localeDir`/_build/`path.to.file`/`filename`.json
       * e.g: if file is src/components/App.js (relative to package.json), then
       * catalog will be in locale/_build/src/components/App.json
       */
      const localeDir = this.opts.localeDir || opts.localeDir
      const { filename, basename } = file.opts
      const baseDir = fsPath.dirname(fsPath.relative(optsBaseDir, filename))
      const targetDir = fsPath.join(localeDir, '_build', baseDir)

      const messages = file.get(MESSAGES)
      const catalog = {}

      // no messages, skip file
      if (!messages.size) return

      messages.forEach((value, key) => { catalog[key] = value })

      mkdirp.sync(targetDir)
      fs.writeFileSync(
        fsPath.join(targetDir, `${basename}.json`),
        JSON.stringify(catalog, null, 2)
      )
    }
  }
}

import fs from 'fs'
import fsPath from 'path'
import mkdirp from 'mkdirp'
import pkgConf from 'pkg-conf'

const MESSAGES  = Symbol('I18nMessages')

function addMessage(path, messages, attrs) {
  const { id } = attrs
  delete attrs.id

  if (messages.has(id)) {
    const message = messages.get(id)
    if (message.defaults !== attrs.defaults) {
      throw path.buildCodeFrameError("Different defaults for the same message ID.")
    } else {
      [].push.apply(message.origin, attrs.origin)
    }
  } else {
    messages.set(id, attrs)
  }
}

export default function({ types: t }) {
  const opts = pkgConf.sync('lingui', {
    cwd: __dirname,
    skipOnFalse: true,
    defaults: {
      localeDir: './locale'
    }
  })
  const optsBaseDir = fsPath.dirname(pkgConf.filepath(opts))

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

        const filename = fsPath.relative(optsBaseDir, file.opts.filename)
        const line = node.openingElement.loc.start.line
        attrs.origin = [[filename, line]]

        addMessage(path, messages, attrs)
      }
    },

    pre(file) {
      // Ignore else path for now. Collision is possible if other plugin is
      // using the same Symbol('I18nMessages').
      // istanbul ignore else
      if (!file.has(MESSAGES)) {
        file.set(MESSAGES, new Map())
      }
    },

    post(file) {
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

      messages.forEach((value, key) => catalog[key] = value)

      mkdirp.sync(targetDir)
      fs.writeFileSync(
        fsPath.join(targetDir, `${basename}.json`),
        JSON.stringify(catalog, null, 2)
      )
    }
  }
}

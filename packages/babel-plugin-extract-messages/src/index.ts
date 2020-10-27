import fs from "fs"
import fsPath from "path"
import mkdirp from "mkdirp"
import generate from "@babel/generator"
import { getConfig } from "@lingui/conf"

const CONFIG = Symbol("I18nConfig")

// Map of messages
const MESSAGES = Symbol("I18nMessages")

// We need to remember all processed nodes. When JSX expressions are
// replaced with CallExpressions, all children are traversed for each CallExpression.
// Then, i18n._ methods are visited multiple times for each parent CallExpression.
const VISITED = Symbol("I18nVisited")

function addMessage(
  path,
  messages,
  { id, message: newDefault, origin, ...props }
) {
  if (messages.has(id)) {
    const message = messages.get(id)

    // only set/check default language when it's defined.
    if (message.message && newDefault && message.message !== newDefault) {
      throw path.buildCodeFrameError(
        "Different defaults for the same message ID."
      )
    } else {
      if (newDefault) {
        message.message = newDefault
      }

      ;[].push.apply(message.origin, origin)
    }
  } else {
    messages.set(id, { ...props, message: newDefault, origin })
  }
}

export default function ({ types: t }) {
  let localTransComponentName

  function isTransComponent(node) {
    return (
      t.isJSXElement(node) &&
      t.isJSXIdentifier(node.openingElement.name, {
        name: localTransComponentName,
      })
    )
  }

  const isI18nMethod = (node) =>
    t.isMemberExpression(node) &&
    t.isIdentifier(node.object, { name: "i18n" }) &&
    t.isIdentifier(node.property, { name: "_" })

  function collectMessage(path, file, props) {
    const messages = file.get(MESSAGES)

    const rootDir = file.get(CONFIG).rootDir
    const filename = fsPath
      .relative(rootDir, file.opts.filename)
      .replace(/\\/g, "/")
    const line = path.node.loc ? path.node.loc.start.line : null
    props.origin = [[filename, line]]

    addMessage(path, messages, props)
  }

  return {
    visitor: {
      // Get the local name of Trans component. Usually it's just `Trans`, but
      // it might be different when the import is aliased:
      // import { Trans as T } from '@lingui/react';
      ImportDeclaration(path) {
        const { node } = path

        const moduleName = node.source.value
        if (
          !["@lingui/react", "@lingui/macro", "@lingui/core"].includes(
            moduleName
          )
        )
          return

        const importDeclarations = {}
        if (moduleName === "@lingui/react" || moduleName === "@lingui/macro") {
          node.specifiers.forEach((specifier) => {
            importDeclarations[specifier.imported.name] = specifier.local.name
          })

          // Trans import might be missing if there's just Plural or similar macro.
          // If there's no alias, consider it was imported as Trans.
          localTransComponentName = importDeclarations["Trans"] || importDeclarations["TransWithHtml"] || "Trans" || "TransWithHtml"
        }

        if (!node.specifiers.length) {
          path.remove()
        }
      },

      // Extract translation from <Trans /> component.
      JSXElement(path, { file }) {
        const { node } = path
        if (!localTransComponentName || !isTransComponent(node)) return

        const attrs = node.openingElement.attributes || []

        const props = attrs.reduce((acc, item) => {
          const key = item.name.name
          if (key === "id" || key === "message" || key === "comment") {
            if (item.value.value) {
              acc[key] = item.value.value
            } else if (
              item.value.expression &&
              t.isStringLiteral(item.value.expression)
            ) {
              acc[key] = item.value.expression.value
            }
          }
          return acc
        }, {})

        if (!props.id) {
          // <Trans id={message} /> is valid, don't raise warning
          const idProp = attrs.filter((item) => item.name.name === "id")[0]
          if (idProp === undefined || t.isLiteral(props.id)) {
            console.warn("Missing message ID, skipping.")
            console.warn(generate(node).code)
          }
          return
        }

        collectMessage(path, file, props)
      },

      CallExpression(path, { file }) {
        const visited = file.get(VISITED)
        if (visited.has(path.node)) return

        const hasComment = [path.node, path.parent].find(
          ({ leadingComments }) => {
            return (
              leadingComments &&
              leadingComments.filter((node) =>
                node.value.match(/^\s*i18n\s*$/)
              )[0]
            )
          }
        )
        if (!hasComment) return

        const props = {
          id: path.node.arguments[0].value,
        }

        const copyOptions = ["message", "comment"]

        if (t.isObjectExpression(path.node.arguments[2])) {
          path.node.arguments[2].properties.forEach((property) => {
            if (!copyOptions.includes(property.key.name)) return

            props[property.key.name] = property.value.value
          })
        }

        visited.add(path.node)
        collectMessage(path, file, props)
      },

      StringLiteral(path, { file }) {
        const visited = file.get(VISITED)

        const comment =
          path.node.leadingComments &&
          path.node.leadingComments.filter((node) =>
            node.value.match(/^\s*i18n/)
          )[0]

        if (!comment || visited.has(path.node)) {
          return
        }

        visited.add(path.node)

        const props = {
          id: path.node.value,
        }

        collectMessage(path, file, props)
      },

      // Extract message descriptors
      ObjectExpression(path, { file }) {
        const visited = file.get(VISITED)

        const comment =
          path.node.leadingComments &&
          path.node.leadingComments.filter((node) =>
            node.value.match(/^\s*i18n/)
          )[0]

        if (!comment || visited.has(path.node)) {
          return
        }

        visited.add(path.node)

        const props = {}
        const copyProps = ["id", "message", "comment"]
        path.node.properties
          .filter(({ key }) => copyProps.indexOf(key.name) !== -1)
          .forEach(({ key, value }, i) => {
            if (key.name === "comment" && !t.isStringLiteral(value)) {
              throw path
                .get(`properties.${i}.value`)
                .buildCodeFrameError("Only strings are supported as comments.")
            }

            props[key.name] = value.value
          })

        collectMessage(path, file, props)
      },
    },

    pre(file) {
      localTransComponentName = null

      // Skip validation because config is loaded for each file.
      // Config was already validated in CLI.
      file.set(
        CONFIG,
        getConfig({ cwd: file.opts.filename, skipValidation: true })
      )

      // Ignore else path for now. Collision is possible if other plugin is
      // using the same Symbol('I18nMessages').
      // istanbul ignore else
      if (!file.has(MESSAGES)) {
        file.set(MESSAGES, new Map())
      }

      file.set(VISITED, new WeakSet())
    },

    post(file) {
      /* Write catalog to directory `localeDir`/_build/`path.to.file`/`filename`.json
       * e.g: if file is src/components/App.js (relative to package.json), then
       * catalog will be in locale/_build/src/components/App.json
       */
      const config = file.get(CONFIG)
      const localeDir = this.opts.localeDir || config.localeDir
      const { filename } = file.opts
      const rootDir = config.rootDir
      const baseDir = fsPath.dirname(fsPath.relative(rootDir, filename))
      const targetDir = fsPath.join(localeDir, "_build", baseDir)

      const messages = file.get(MESSAGES)
      const catalog = {}
      const baseName = fsPath.basename(filename)
      const catalogFilename = fsPath.join(targetDir, `${baseName}.json`)

      mkdirp.sync(targetDir)

      // no messages, skip file
      if (!messages.size) {
        // clean any existing catalog
        if (fs.existsSync(catalogFilename)) {
          fs.writeFileSync(catalogFilename, JSON.stringify({}))
        }

        return
      }

      messages.forEach((value, key) => {
        catalog[key] = value
      })

      fs.writeFileSync(catalogFilename, JSON.stringify(catalog, null, 2))
    },
  }
}

import { createMacro, MacroParams } from "babel-plugin-macros"
import { getConfig as loadConfig, LinguiConfigNormalized } from "@lingui/conf"

import MacroJS from "./macroJs"
import MacroJSX from "./macroJsx"
import { NodePath } from "@babel/traverse"
import * as t from "@babel/types"
export type LinguiMacroOpts = {
  // explicitly set by CLI when running extraction process
  extract?: boolean
  linguiConfig?: LinguiConfigNormalized
}

const jsMacroTags = new Set([
  "defineMessage",
  "msg",
  "arg",
  "t",
  "useLingui",
  "plural",
  "select",
  "selectOrdinal",
])

const jsxMacroTags = new Set(["Trans", "Plural", "Select", "SelectOrdinal"])

let config: LinguiConfigNormalized

function getConfig(_config?: LinguiConfigNormalized) {
  if (_config) {
    config = _config
  }
  if (!config) {
    config = loadConfig()
  }
  return config
}

function macro({ references, state, babel, config }: MacroParams) {
  const opts: LinguiMacroOpts = config as LinguiMacroOpts

  const body = state.file.path.node.body
  const {
    i18nImportModule,
    i18nImportName,
    TransImportModule,
    TransImportName,
  } = getConfig(opts.linguiConfig).runtimeConfigModule

  const jsxNodes = new Set<NodePath>()
  const jsNodes = new Set<NodePath>()
  let needsI18nImport = false
  let needsUseLinguiImport = false

  // create unique name for all _t, must be outside the loop
  const uniq_tIdentifier = state.file.scope.generateUidIdentifier("_t")

  let nameMap = new Map<string, string>()
  Object.keys(references).forEach((tagName) => {
    const nodes = references[tagName]

    if (jsMacroTags.has(tagName)) {
      nodes.forEach((path) => {
        if (tagName !== "useLingui") {
          nameMap.set(tagName, (path.node as t.Identifier).name)
          jsNodes.add(path.parentPath)
        } else {
          needsUseLinguiImport = true
          nameMap.set("_t", uniq_tIdentifier.name)
          processUseLingui(path, uniq_tIdentifier.name)?.forEach((n) =>
            jsNodes.add(n)
          )
        }
      })
    } else if (jsxMacroTags.has(tagName)) {
      // babel-plugin-macros return JSXIdentifier nodes.
      // Which is for every JSX element would be presented twice (opening / close)
      // Here we're taking JSXElement and dedupe it.
      nodes.forEach((path) => {
        nameMap.set(tagName, (path.node as t.JSXIdentifier).name)

        // identifier.openingElement.jsxElement
        jsxNodes.add(path.parentPath.parentPath)
      })
    } else {
      throw nodes[0].buildCodeFrameError(`Unknown macro ${tagName}`)
    }
  })

  const stripNonEssentialProps =
    process.env.NODE_ENV == "production" && !opts.extract

  const jsNodesArray = Array.from(jsNodes)

  jsNodesArray.filter(isRootPath(jsNodesArray)).forEach((path) => {
    const macro = new MacroJS(babel, {
      i18nImportName,
      stripNonEssentialProps,
      nameMap,
    })
    try {
      macro.replacePath(path)
      needsI18nImport = needsI18nImport || macro.needsI18nImport
      needsUseLinguiImport = needsUseLinguiImport || macro.needsUseLinguiImport
    } catch (e) {
      reportUnsupportedSyntax(path, e as Error)
    }
  })

  const jsxNodesArray = Array.from(jsxNodes)

  jsxNodesArray.filter(isRootPath(jsxNodesArray)).forEach((path) => {
    const macro = new MacroJSX(babel, { stripNonEssentialProps, nameMap })

    try {
      macro.replacePath(path)
    } catch (e) {
      reportUnsupportedSyntax(path, e as Error)
    }
  })

  if (needsUseLinguiImport) {
    addImport(babel, body, "@lingui/react", "useLingui")
  }

  if (needsI18nImport) {
    addImport(babel, body, i18nImportModule, i18nImportName)
  }

  if (jsxNodes.size) {
    addImport(babel, body, TransImportModule, TransImportName)
  }
}

function reportUnsupportedSyntax(path: NodePath, e: Error) {
  throw path.buildCodeFrameError(
    `Unsupported macro usage. Please check the examples at https://lingui.dev/ref/macro#examples-of-js-macros.
 If you think this is a bug, fill in an issue at https://github.com/lingui/js-lingui/issues

 Error: ${e.message}`
  )
}

/**
 * Pre-process useLingui macro
 * 1. Get references to destructed t function for macro processing
 * 2. Transform usage to non-macro useLingui
 *
 * @returns Array of paths to useLingui's t macro
 */
function processUseLingui(
  path: NodePath,
  newIdentifier: string
): NodePath[] | null {
  if (!path.parentPath.parentPath.isVariableDeclarator()) {
    reportUnsupportedSyntax(
      path,
      new Error(
        "useLingui must be used in variable declaration. const { t } = useLingui()"
      )
    )
    return null
  }

  const varDec = path.parentPath.parentPath.node
  const _property = t.isObjectPattern(varDec.id)
    ? varDec.id.properties.find(
        (
          property
        ): property is t.ObjectProperty & {
          key: t.Identifier
          value: t.Identifier
        } =>
          t.isObjectProperty(property) &&
          t.isIdentifier(property.key) &&
          t.isIdentifier(property.value) &&
          property.key.name == "t"
      )
    : null

  if (!_property) {
    reportUnsupportedSyntax(
      path,
      new Error(
        `Must destruct \`t\` when using useLingui macro, i.e:
const { t } = useLingui()
or
const { t: _ } = useLingui()`
      )
    )
    return null
  }

  if (t.isIdentifier(path.node)) {
    // rename to standard useLingui
    path.scope.rename(path.node.name, "useLingui")
  }

  // rename to standard useLingui _
  _property.key.name = "_"
  path.scope.rename(_property.value.name, newIdentifier)

  return path.scope
    .getBinding(_property.value.name)
    ?.referencePaths.filter(
      // dont process array expression to allow use in dependency arrays
      (path) => !path.parentPath.isArrayExpression()
    )
    .map((path) => path.parentPath)
}

function addImport(
  babel: MacroParams["babel"],
  body: t.Statement[],
  module: string,
  importName: string
) {
  const { types: t } = babel

  const linguiImport = body.find(
    (importNode) =>
      t.isImportDeclaration(importNode) &&
      importNode.source.value === module &&
      // https://github.com/lingui/js-lingui/issues/777
      importNode.importKind !== "type"
  ) as t.ImportDeclaration

  const tIdentifier = t.identifier(importName)
  // Handle adding the import or altering the existing import
  if (linguiImport) {
    if (
      !linguiImport.specifiers.find(
        (specifier) =>
          t.isImportSpecifier(specifier) &&
          t.isIdentifier(specifier.imported, { name: importName })
      )
    ) {
      linguiImport.specifiers.push(t.importSpecifier(tIdentifier, tIdentifier))
    }
  } else {
    body.unshift(
      t.importDeclaration(
        [t.importSpecifier(tIdentifier, tIdentifier)],
        t.stringLiteral(module)
      )
    )
  }
}

/**
 * Filtering nested macro calls
 *
 * <Macro>
 *   <Macro /> <-- this would be filtered out
 * </Macro>
 */
function isRootPath(allPath: NodePath[]) {
  return (node: NodePath) =>
    (function traverse(path): boolean {
      if (!path.parentPath) {
        return true
      } else {
        return !allPath.includes(path.parentPath) && traverse(path.parentPath)
      }
    })(node)
}

;[...jsMacroTags, ...jsxMacroTags].forEach((name) => {
  Object.defineProperty(module.exports, name, {
    get() {
      throw new Error(
        `The macro you imported from "@lingui/macro" is being executed outside the context of compilation with babel-plugin-macros. ` +
          `This indicates that you don't have the babel plugin "babel-plugin-macros" configured correctly. ` +
          `Please see the documentation for how to configure babel-plugin-macros properly: ` +
          "https://github.com/kentcdodds/babel-plugin-macros/blob/main/other/docs/user.md"
      )
    },
  })
})

export default createMacro(macro, {
  configName: "lingui",
})

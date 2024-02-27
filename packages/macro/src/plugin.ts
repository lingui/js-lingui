import type { PluginObj, Visitor, PluginPass } from "@babel/core"
import * as babelTypes from "@babel/types"
import MacroJSX from "./macroJsx"
import { NodePath } from "@babel/traverse"
import MacroJs from "./macroJs"
import { MACRO_PACKAGE } from "./constants"
import { LinguiConfigNormalized, getConfig as loadConfig } from "@lingui/conf"

let config: LinguiConfigNormalized

export type LinguiPluginOpts = {
  // explicitly set by CLI when running extraction process
  extract?: boolean
  linguiConfig?: LinguiConfigNormalized
}

function getConfig(_config?: LinguiConfigNormalized) {
  if (_config) {
    config = _config
  }
  if (!config) {
    config = loadConfig()
  }
  return config
}

function reportUnsupportedSyntax(path: NodePath, e: Error) {
  throw path.buildCodeFrameError(
    `Unsupported macro usage. Please check the examples at https://lingui.dev/ref/macro#examples-of-js-macros.
 If you think this is a bug, fill in an issue at https://github.com/lingui/js-lingui/issues

 Error: ${e.message}`
  )
}

export default function ({
  types: t,
}: {
  types: typeof babelTypes
}): PluginObj {
  let uniqI18nName: string
  let uniqTransName: string
  let uniqUseLinguiName: string

  let needsI18nImport = false
  let needsUseLinguiImport = false
  let needsTransImport = false

  // todo: check if babel re-execute this function on each file
  const processedNodes = new Set<babelTypes.Node>()

  function addImport(
    path: NodePath,
    module: string,
    importName: string,
    bindingName: string
  ) {
    path.insertAfter(
      t.importDeclaration(
        [
          t.importSpecifier(
            t.identifier(bindingName),
            t.identifier(importName)
          ),
        ],
        t.stringLiteral(module)
      )
    )
  }

  return {
    pre(state) {
      console.log(state.opts as LinguiPluginOpts)
    },
    visitor: {
      Program: {
        enter(path, state) {
          const macroImports = path.get("body").filter((statement) => {
            return (
              statement.isImportDeclaration() &&
              statement.get("source").node.value === MACRO_PACKAGE
            )
          })

          if (!macroImports.length) {
            return path.stop()
          }

          state.set(
            "config",
            getConfig((state.opts as LinguiPluginOpts).linguiConfig)
          )

          uniqI18nName = path.scope.generateUid("i18n")
          uniqTransName = path.scope.generateUid("Trans")
          uniqUseLinguiName = path.scope.generateUid("useLingui")
        },
        exit(path, state) {
          const macroImports = path.get("body").filter((statement) => {
            return (
              statement.isImportDeclaration() &&
              statement.get("source").node.value === MACRO_PACKAGE
            )
          })

          const config = getConfig(
            (state.opts as LinguiPluginOpts).linguiConfig
          )

          const {
            i18nImportModule,
            i18nImportName,
            TransImportModule,
            TransImportName,
            useLinguiImportModule,
            useLinguiImportName,
          } = config.runtimeConfigModule

          if (needsI18nImport) {
            addImport(
              macroImports[0],
              i18nImportModule,
              i18nImportName,
              uniqI18nName
            )
          }

          if (needsUseLinguiImport) {
            addImport(
              macroImports[0],
              useLinguiImportModule,
              useLinguiImportName,
              uniqUseLinguiName
            )
          }

          if (needsTransImport) {
            addImport(
              macroImports[0],
              TransImportModule,
              TransImportName,
              uniqTransName
            )
          }

          macroImports.forEach((path) => path.remove())
        },
      },
      JSXElement(path, state) {
        if (processedNodes.has(path.node)) {
          return
        }

        const macro = new MacroJSX(
          { types: t },
          {
            transImportName: uniqTransName,
            stripNonEssentialProps:
              process.env.NODE_ENV == "production" &&
              !(state.opts as LinguiPluginOpts).extract,
          }
        )

        let newNode: false | babelTypes.Node

        try {
          newNode = macro.replacePath(path)
        } catch (e) {
          reportUnsupportedSyntax(path, e as Error)
        }

        if (newNode) {
          processedNodes.add(newNode)
          path.replaceWith(newNode)
          needsTransImport = true
        }
      },

      "CallExpression|TaggedTemplateExpression"(
        path: NodePath<
          babelTypes.CallExpression | babelTypes.TaggedTemplateExpression
        >,
        state: PluginPass
      ) {
        if (processedNodes.has(path.node)) {
          return
        }
        const macro = new MacroJs(
          { types: t },
          {
            stripNonEssentialProps:
              process.env.NODE_ENV == "production" &&
              !(state.opts as LinguiPluginOpts).extract,
            i18nImportName: uniqI18nName,
            useLinguiImportName: uniqUseLinguiName,
          }
        )
        let newNode: false | babelTypes.Node

        try {
          newNode = macro.replacePath(path)
        } catch (e) {
          reportUnsupportedSyntax(path, e as Error)
        }

        if (newNode) {
          processedNodes.add(newNode)
          path.replaceWith(newNode)
        }

        needsI18nImport = needsI18nImport || macro.needsI18nImport
        needsUseLinguiImport =
          needsUseLinguiImport || macro.needsUseLinguiImport
      },
    } as Visitor<PluginPass>,
  }
}

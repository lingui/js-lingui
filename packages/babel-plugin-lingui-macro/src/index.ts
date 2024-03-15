import type { PluginObj, Visitor, PluginPass } from "@babel/core"
import type * as babelTypes from "@babel/types"
import MacroJSX from "./macroJsx"
import { NodePath } from "@babel/traverse"
import MacroJs from "./macroJs"
import {
  MACRO_CORE_PACKAGE,
  MACRO_REACT_PACKAGE,
  MACRO_LEGACY_PACKAGE,
} from "./constants"
import {
  type LinguiConfigNormalized,
  getConfig as loadConfig,
} from "@lingui/conf"
import { Program, Identifier } from "@babel/types"

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
  const codeFrameError = path.buildCodeFrameError(
    `Unsupported macro usage. Please check the examples at https://lingui.dev/ref/macro#examples-of-js-macros.
 If you think this is a bug, fill in an issue at https://github.com/lingui/js-lingui/issues

 Error: ${e.message}`
  )

  // show stack trace where error originally happened
  codeFrameError.stack = e.stack
  throw codeFrameError
}

type LinguiSymbol = "Trans" | "useLingui" | "i18n"

export default function ({
  types: t,
}: {
  types: typeof babelTypes
}): PluginObj {
  function addImport(state: PluginPass, name: LinguiSymbol) {
    const path = state.get(
      "macroImport"
    ) as NodePath<babelTypes.ImportDeclaration>

    const config = state.get("linguiConfig") as LinguiConfigNormalized

    if (!state.get("has_import_" + name)) {
      state.set("has_import_" + name, true)
      const [moduleSource, importName] = config.runtimeConfigModule[name]

      const [newPath] = path.insertAfter(
        t.importDeclaration(
          [
            t.importSpecifier(
              getSymbolIdentifier(state, name),
              t.identifier(importName)
            ),
          ],
          t.stringLiteral(moduleSource)
        )
      )

      path.parentPath.scope.registerDeclaration(newPath)
    }

    return path.parentPath.scope.getBinding(
      getSymbolIdentifier(state, name).name
    )
  }

  function getMacroImports(path: NodePath<Program>) {
    return path.get("body").filter((statement) => {
      return (
        statement.isImportDeclaration() &&
        [
          MACRO_CORE_PACKAGE,
          MACRO_REACT_PACKAGE,
          MACRO_LEGACY_PACKAGE,
        ].includes(statement.get("source").node.value)
      )
    })
  }

  function getSymbolIdentifier(
    state: PluginPass,
    name: LinguiSymbol
  ): Identifier {
    return state.get("linguiIdentifiers")[name]
  }

  return {
    name: "lingui-macro-plugin",
    visitor: {
      Program: {
        enter(path, state) {
          const macroImports = getMacroImports(path)

          if (!macroImports.length) {
            return
          }

          state.set("macroImport", macroImports[0])

          state.set(
            "linguiConfig",
            getConfig((state.opts as LinguiPluginOpts).linguiConfig)
          )

          state.set("linguiIdentifiers", {
            i18n: path.scope.generateUidIdentifier("i18n"),
            Trans: path.scope.generateUidIdentifier("Trans"),
            useLingui: path.scope.generateUidIdentifier("useLingui"),
          })

          path.traverse(
            {
              JSXElement(path, state) {
                const macro = new MacroJSX(
                  { types: t },
                  {
                    transImportName: getSymbolIdentifier(state, "Trans").name,
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
                  const [newPath] = path.replaceWith(newNode)
                  addImport(state, "Trans").reference(newPath)
                }
              },

              "CallExpression|TaggedTemplateExpression"(
                path: NodePath<
                  | babelTypes.CallExpression
                  | babelTypes.TaggedTemplateExpression
                >,
                state: PluginPass
              ) {
                const macro = new MacroJs(
                  { types: t },
                  {
                    stripNonEssentialProps:
                      process.env.NODE_ENV == "production" &&
                      !(state.opts as LinguiPluginOpts).extract,
                    i18nImportName: getSymbolIdentifier(state, "i18n").name,
                    useLinguiImportName: getSymbolIdentifier(state, "useLingui")
                      .name,
                  }
                )
                let newNode: false | babelTypes.Node

                try {
                  newNode = macro.replacePath(path)
                } catch (e) {
                  reportUnsupportedSyntax(path, e as Error)
                }

                if (newNode) {
                  const [newPath] = path.replaceWith(newNode)

                  if (macro.needsUseLinguiImport) {
                    addImport(state, "useLingui").reference(newPath)
                  }

                  if (macro.needsI18nImport) {
                    addImport(state, "i18n").reference(newPath)
                  }
                }
              },
            } as Visitor<PluginPass>,
            state
          )
        },
        exit(path, state) {
          const macroImports = getMacroImports(path)
          macroImports.forEach((path) => path.remove())
        },
      },
    } as Visitor<PluginPass>,
  }
}

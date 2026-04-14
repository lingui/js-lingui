import type { PluginObj, PluginPass, Visitor } from "@babel/core"
import type * as babelTypes from "@babel/types"
import { Identifier, Program } from "@babel/types"
import { MacroJSX } from "./macroJsx"
import type { NodePath } from "@babel/traverse"
import { MacroJs } from "./macroJs"
import { JsMacroName } from "./constants"
import {
  getConfig as loadConfig,
  LinguiConfig,
  type LinguiConfigNormalized,
} from "@lingui/conf"
import { ResolvedDescriptorFields } from "./messageDescriptorUtils"
import {
  collectLinguiDirectives,
  findDirectiveForLine,
} from "./linguiDirective"

let config: LinguiConfigNormalized

export type LinguiPluginOpts = {
  /**
   * Controls which descriptor fields are preserved in the transformed code.
   *
   * - `"auto"` (default): In production (`NODE_ENV === "production"`), keeps only the `id`.
   *    Otherwise, behaves like `"all"`.
   * - `"all"`: Keeps every field: `id`, `message`, `context`, and `comment`.
   *    Used by Lingui CLI during extraction.
   * - `"id-only"`: Strips everything except the `id`. Most optimized for production.
   * - `"message"`: Keeps `id`, `message`, and `context` (but not `comment`).
   *    Use when you need runtime access to message and context.
   *
   * @default "auto"
   */
  descriptorFields?: "auto" | "all" | "id-only" | "message"

  /**
   * Resolved and normalized Lingui Configuration
   */
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

 Error: ${e.message}`,
  )

  // show stack trace where error originally happened
  codeFrameError.stack = codeFrameError.message + "\n" + e.stack
  throw codeFrameError
}

const VALID_DESCRIPTOR_FIELDS = [
  "auto",
  "all",
  "id-only",
  "message",
] as LinguiPluginOpts["descriptorFields"][]

const REMOVED_OPTIONS: Record<string, string> = {
  extract:
    'Use `descriptorFields: "all"` instead of `extract: true` to preserve all fields during extraction.',
  stripMessageField:
    'Use `descriptorFields: "id-only"` instead of `stripMessageField: true`, ' +
    'or `descriptorFields: "message"` to keep message and context.',
}

function resolveDescriptorFields(
  opts: LinguiPluginOpts,
): ResolvedDescriptorFields {
  // introduced in v6, remove these hints in V7
  for (const [key, hint] of Object.entries(REMOVED_OPTIONS)) {
    if (key in (opts as Record<string, unknown>)) {
      throw new Error(`[lingui] Option "${key}" has been removed. ${hint}`)
    }
  }

  const mode = opts.descriptorFields ?? "auto"

  if (!VALID_DESCRIPTOR_FIELDS.includes(mode)) {
    throw new Error(
      `[lingui] Invalid descriptorFields value: "${mode}". ` +
        `Expected one of: ${VALID_DESCRIPTOR_FIELDS.join(", ")}.`,
    )
  }

  if (mode !== "auto") {
    return mode as ResolvedDescriptorFields
  }
  // "auto": production → "id-only", otherwise → "all"
  return process.env.NODE_ENV === "production" ? "id-only" : "all"
}

type LinguiSymbol = "Trans" | "useLingui" | "i18n"

const getIdentifierPath = ((path: NodePath, node: Identifier) => {
  let foundPath: NodePath

  path.traverse(
    {
      Identifier: (path) => {
        if (path.node === node) {
          foundPath = path
          path.stop()
        }
      },
    },
    path.state,
  )

  return foundPath
}) as any

type MacroImports = {
  corePackage: Set<NodePath<babelTypes.ImportDeclaration>>
  jsxPackage: Set<NodePath<babelTypes.ImportDeclaration>>
  all: Set<NodePath<babelTypes.ImportDeclaration>>
}

const LinguiSymbolToImportMap = {
  Trans: "jsxPackage",
  useLingui: "jsxPackage",
  i18n: "corePackage",
} satisfies Record<LinguiSymbol, keyof LinguiConfig["macro"]>

export default function ({
  types: t,
}: {
  types: typeof babelTypes
}): PluginObj {
  function addImport(
    macroImports: MacroImports,
    state: PluginPass,
    name: LinguiSymbol,
  ) {
    const [path] = macroImports[LinguiSymbolToImportMap[name]]

    const config = state.get("linguiConfig") as LinguiConfigNormalized

    if (!state.get("has_import_" + name)) {
      state.set("has_import_" + name, true)
      const [moduleSource, importName] = config.runtimeConfigModule[name]

      const importDecl = t.importDeclaration(
        [
          t.importSpecifier(
            getSymbolIdentifier(state, name),
            t.identifier(importName),
          ),
        ],
        t.stringLiteral(moduleSource),
      )

      importDecl.loc = path.node.loc

      const [newPath] = path.insertAfter(importDecl)

      path.parentPath.scope.registerDeclaration(newPath)
    }

    return path.parentPath.scope.getBinding(
      getSymbolIdentifier(state, name).name,
    )
  }

  function getMacroImports(path: NodePath<Program>): MacroImports {
    const corePackage = new Set(
      path
        .get("body")
        .filter(
          (statement) =>
            statement.isImportDeclaration() &&
            config.macro.corePackage.includes(
              statement.get("source").node.value,
            ),
        ) as NodePath<babelTypes.ImportDeclaration>[],
    )

    const jsxPackage = new Set(
      path
        .get("body")
        .filter(
          (statement) =>
            statement.isImportDeclaration() &&
            config.macro.jsxPackage.includes(
              statement.get("source").node.value,
            ),
        ) as NodePath<babelTypes.ImportDeclaration>[],
    )

    return {
      corePackage,
      jsxPackage,
      all: new Set([...corePackage, ...jsxPackage]),
    }
  }

  function getSymbolIdentifier(
    state: PluginPass,
    name: LinguiSymbol,
  ): Identifier {
    return state.get("linguiIdentifiers")[name]
  }

  function isLinguiIdentifier(
    path: NodePath,
    node: Identifier,
    macro: JsMacroName,
  ) {
    let identPath = getIdentifierPath(path, node)

    if (macro === JsMacroName.useLingui) {
      if (
        config.macro.jsxPackage.some((moduleSource) =>
          identPath.referencesImport(moduleSource, JsMacroName.useLingui),
        )
      ) {
        return true
      }
    } else {
      // useLingui might ask for identifiers which are not direct child of macro
      identPath = identPath || getIdentifierPath(path.getFunctionParent(), node)

      if (
        config.macro.corePackage.some((moduleSource) =>
          identPath.referencesImport(moduleSource, macro),
        )
      ) {
        return true
      }
    }
    return false
  }
  return {
    name: "lingui-macro-plugin",
    visitor: {
      Program: {
        enter(path, state) {
          state.set(
            "linguiConfig",
            getConfig((state.opts as LinguiPluginOpts).linguiConfig),
          )

          const macroImports = getMacroImports(path)

          if (!macroImports.all.size) {
            return
          }

          state.set("linguiIdentifiers", {
            i18n: path.scope.generateUidIdentifier("i18n"),
            Trans: path.scope.generateUidIdentifier("Trans"),
            useLingui: path.scope.generateUidIdentifier("useLingui"),
          } satisfies Record<LinguiSymbol, babelTypes.Identifier>)

          const directives = collectLinguiDirectives(
            (state.file.ast as babelTypes.File).comments,
          )
          const getDirective = (line: number) =>
            findDirectiveForLine(directives, line)

          path.traverse(
            {
              JSXElement(path, state) {
                const linguiConfig = state.get(
                  "linguiConfig",
                ) as LinguiConfigNormalized

                const macro = new MacroJSX(
                  { types: t },
                  {
                    transImportName: getSymbolIdentifier(state, "Trans").name,
                    descriptorFields: resolveDescriptorFields(
                      state.opts as LinguiPluginOpts,
                    ),
                    isLinguiIdentifier: (node: Identifier, macro) =>
                      isLinguiIdentifier(path, node, macro),
                    getDirective,
                    jsxPlaceholderAttribute:
                      linguiConfig.macro?.jsxPlaceholderAttribute,
                    jsxPlaceholderDefaults:
                      linguiConfig.macro?.jsxPlaceholderDefaults,
                  },
                )

                let newNode: false | babelTypes.Node

                try {
                  newNode = macro.replacePath(path)
                } catch (e) {
                  reportUnsupportedSyntax(path, e as Error)
                }

                if (newNode) {
                  const [newPath] = path.replaceWith(newNode)
                  addImport(macroImports, state, "Trans").reference(newPath)
                }
              },

              "CallExpression|TaggedTemplateExpression"(
                path: NodePath<
                  | babelTypes.CallExpression
                  | babelTypes.TaggedTemplateExpression
                >,
                state: PluginPass,
              ) {
                const macro = new MacroJs({
                  descriptorFields: resolveDescriptorFields(
                    state.opts as LinguiPluginOpts,
                  ),
                  i18nImportName: getSymbolIdentifier(state, "i18n").name,
                  useLinguiImportName: getSymbolIdentifier(state, "useLingui")
                    .name,
                  isLinguiIdentifier: (node: Identifier, macro) =>
                    isLinguiIdentifier(path, node, macro),
                  getDirective,
                })
                let newNode: false | babelTypes.Node

                try {
                  newNode = macro.replacePath(path)
                } catch (e) {
                  reportUnsupportedSyntax(path, e as Error)
                }

                if (newNode) {
                  const [newPath] = path.replaceWith(newNode)

                  if (macro.needsUseLinguiImport) {
                    addImport(macroImports, state, "useLingui").reference(
                      newPath,
                    )

                    // rebuild scope bindings if useLingui hook was used
                    // allow further plugins, such as React Compiler to process
                    // source correctly
                    path.scope.crawl()
                  }

                  if (macro.needsI18nImport) {
                    addImport(macroImports, state, "i18n").reference(newPath)
                  }
                }
              },
            } as Visitor<PluginPass>,
            state,
          )
        },
        exit(path, state) {
          const macroImports = getMacroImports(path)
          macroImports.all.forEach((path) => path.remove())
        },
      },
    } as Visitor<PluginPass>,
  }
}

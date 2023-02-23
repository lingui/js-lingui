import type { NodePath } from "@babel/traverse"
import type { ImportDeclaration, Program } from "@babel/types"
import type * as babelTypes from "@babel/types"

export const makeCounter =
  (index = 0) =>
  () =>
    index++

/**
 * Filtering nested macro calls
 *
 * <Macro>
 *   <Macro /> <-- this would be filtered out
 * </Macro>
 */
export function isRootPath(allPath: NodePath[]) {
  return (node: NodePath) =>
    (function traverse(path): boolean {
      if (!path.parentPath) {
        return true
      } else {
        return !allPath.includes(path.parentPath) && traverse(path.parentPath)
      }
    })(node)
}

export function addImport(
  t: typeof babelTypes,
  program: Program,
  module: string,
  importName: string
) {
  const linguiImport = program.body.find(
    (importNode) =>
      t.isImportDeclaration(importNode) &&
      importNode.source.value === module &&
      // https://github.com/lingui/js-lingui/issues/777
      importNode.importKind !== "type"
  ) as ImportDeclaration

  const tIdentifier = t.identifier(importName)
  // Handle adding the import or altering the existing import
  if (linguiImport) {
    if (
      linguiImport.specifiers.findIndex(
        (specifier) =>
          t.isImportSpecifier(specifier) &&
          t.isIdentifier(specifier.imported, { name: importName })
      ) === -1
    ) {
      linguiImport.specifiers.push(t.importSpecifier(tIdentifier, tIdentifier))
    }
  } else {
    program.body.unshift(
      t.importDeclaration(
        [t.importSpecifier(tIdentifier, tIdentifier)],
        t.stringLiteral(module)
      )
    )
  }
}

export function throwNonMacroContextError(packageName: string) {
  throw new Error(
    `The macro you imported from "${packageName}" is being executed outside the context of compilation with babel-plugin-macros. ` +
      `This indicates that you don't have the babel plugin "babel-plugin-macros" or "@lingui/swc-plugin" configured correctly.` +
      `\n Please see the documentation for how to configure babel-plugin-macros properly: ` +
      "https://github.com/kentcdodds/babel-plugin-macros/blob/main/other/docs/user.md" +
      `\n For SWC Version: https://lingui.dev/ref/swc-plugin`
  )
}

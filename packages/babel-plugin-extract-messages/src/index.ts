import type * as BabelTypesNamespace from "@babel/types"
import {
  Expression,
  Identifier,
  ImportSpecifier,
  JSXAttribute,
  Node,
  ObjectExpression,
  ObjectProperty,
} from "@babel/types"
import type { PluginObj, PluginPass } from "@babel/core"
import type { NodePath } from "@babel/core"
import type { Hub } from "@babel/traverse"

type BabelTypes = typeof BabelTypesNamespace

export type ExtractedMessage = {
  id: string

  message?: string
  context?: string
  origin?: Origin

  comment?: string
}

export type ExtractPluginOpts = {
  onMessageExtracted(msg: ExtractedMessage): void
}

type RawMessage = {
  id?: string
  message?: string
  comment?: string
  context?: string
}

export type Origin = [filename: string, line: number, column?: number]

function collectMessage(
  path: NodePath<any>,
  props: RawMessage,
  ctx: PluginPass
) {
  // prevent from adding undefined msgid
  if (props.id === undefined) return

  const node: Node = path.node

  const line = node.loc ? node.loc.start.line : null
  const column = node.loc ? node.loc.start.column : null

  ;(ctx.opts as ExtractPluginOpts).onMessageExtracted({
    id: props.id,
    message: props.message,
    context: props.context,
    comment: props.comment,
    origin: [ctx.file.opts.filename, line, column],
  })
}

function getTextFromExpression(
  t: BabelTypes,
  exp: Expression,
  hub: Hub,
  emitErrorOnVariable = true
): string {
  if (t.isStringLiteral(exp)) {
    return exp.value
  }

  if (t.isBinaryExpression(exp)) {
    return (
      getTextFromExpression(
        t,
        exp.left as Expression,
        hub,
        emitErrorOnVariable
      ) +
      getTextFromExpression(
        t,
        exp.right as Expression,
        hub,
        emitErrorOnVariable
      )
    )
  }

  if (t.isTemplateLiteral(exp)) {
    if (exp?.quasis.length > 1) {
      console.warn(
        hub.buildError(
          exp,
          "Could not extract from template literal with expressions.",
          SyntaxError
        ).message
      )
      return ""
    }

    return exp.quasis[0]?.value?.cooked
  }

  if (emitErrorOnVariable) {
    console.warn(
      hub.buildError(
        exp,
        "Only strings or template literals could be extracted.",
        SyntaxError
      ).message
    )
  }
}

function extractFromObjectExpression(
  t: BabelTypes,
  exp: ObjectExpression,
  hub: Hub,
  keys: readonly string[]
) {
  const props: Record<string, string> = {}

  ;(exp.properties as ObjectProperty[]).forEach(({ key, value }, i) => {
    const name = (key as Identifier).name

    if (!keys.includes(name as any)) return
    props[name] = getTextFromExpression(t, value as Expression, hub)
  })

  return props
}

export default function ({ types: t }: { types: BabelTypes }): PluginObj {
  let localTransComponentName: string
  let localCoreI18nName: string

  function isTransComponent(node: Node) {
    return (
      t.isJSXElement(node) &&
      t.isJSXIdentifier(node.openingElement.name, {
        name: localTransComponentName,
      })
    )
  }

  const isI18nMethod = (node: Node) =>
    t.isMemberExpression(node) &&
    t.isIdentifier(node.object, { name: "i18n" }) &&
    t.isIdentifier(node.property, { name: "_" })

  const isI18nTMethod = (node: Node) =>
    t.isMemberExpression(node) &&
    t.isIdentifier(node.object, { name: localCoreI18nName }) &&
    t.isIdentifier(node.property, { name: "t" })

  function hasI18nComment(node: Node): boolean {
    return (
      node.leadingComments &&
      node.leadingComments.some((comm) => comm.value.match(/^\s*i18n/))
    )
  }
  return {
    visitor: {
      // Get the local name of Trans component. Usually it's just `Trans`, but
      // it might be different when the import is aliased:
      // import { Trans as T } from '@lingui/react';
      ImportDeclaration(path) {
        const { node } = path

        const moduleName = node.source.value
        if (!["@lingui/react", "@lingui/core"].includes(moduleName)) return

        const importDeclarations: Record<string, string> = {}
        if (moduleName === "@lingui/react") {
          node.specifiers.forEach((specifier) => {
            specifier = specifier as ImportSpecifier
            importDeclarations[(specifier.imported as Identifier).name] =
              specifier.local.name
          })

          // Trans import might be missing if there's just Plural or similar macro.
          // If there's no alias, consider it was imported as Trans.
          localTransComponentName = importDeclarations["Trans"] || "Trans"
        }

        const coreImportDeclarations: Record<string, string> = {}
        if (moduleName === "@lingui/core") {
          node.specifiers.forEach((specifier) => {
            specifier = specifier as ImportSpecifier
            coreImportDeclarations[(specifier.imported as Identifier).name] =
              specifier.local.name
          })

          localCoreI18nName = coreImportDeclarations["i18n"] || "i18n"
        }
      },

      // Extract translation from <Trans /> component.
      JSXElement(path, ctx) {
        const { node } = path
        if (!localTransComponentName || !isTransComponent(node)) return

        const attrs = (node.openingElement.attributes as JSXAttribute[]) || []

        const props = attrs.reduce<Record<string, unknown>>((acc, item) => {
          const key = item.name.name
          if (
            key === "id" ||
            key === "message" ||
            key === "comment" ||
            key === "context"
          ) {
            if (t.isStringLiteral(item.value)) {
              acc[key] = item.value.value
            } else if (
              t.isJSXExpressionContainer(item.value) &&
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
          if (idProp === undefined || t.isLiteral(props.id as any)) {
            console.warn(
              path.buildCodeFrameError("Missing message ID, skipping.").message
            )
          }
          return
        }

        collectMessage(path, props, ctx)
      },

      CallExpression(path, ctx) {
        const hasComment = [path.node, path.parent].some((node) =>
          hasI18nComment(node)
        )

        const firstArgument = path.node.arguments[0]

        let props: Record<string, unknown> = {}

        if (
          isI18nTMethod(path.node.callee) &&
          t.isObjectExpression(firstArgument)
        ) {
          props = {
            ...extractFromObjectExpression(t, firstArgument, ctx.file.hub, [
              "id",
              "message",
              "comment",
              "context",
            ]),
          }

          collectMessage(path, props, ctx)
          return
        }

        // support `i18n._` calls written by users in form i18n._(id, variables, descriptor)
        // without explicit annotation with comment
        // calls generated by macro has a form i18n._(/*i18n*/ {descriptor}) and
        // processed by ObjectExpression visitor
        const isNonMacroI18n =
          isI18nMethod(path.node.callee) && !firstArgument?.leadingComments
        if (!hasComment && !isNonMacroI18n) return

        props = {
          id: getTextFromExpression(
            t,
            firstArgument as Expression,
            ctx.file.hub,
            false
          ),
        }

        if (!props.id) {
          return
        }

        const msgDescArg = path.node.arguments[2]

        if (t.isObjectExpression(msgDescArg)) {
          props = {
            ...props,
            ...extractFromObjectExpression(t, msgDescArg, ctx.file.hub, [
              "message",
              "comment",
              "context",
            ]),
          }
        }

        collectMessage(path, props, ctx)
      },

      StringLiteral(path, ctx) {
        if (!hasI18nComment(path.node)) {
          return
        }

        const props = {
          id: path.node.value,
        }

        if (!props.id) {
          console.warn(
            path.buildCodeFrameError("Empty StringLiteral, skipping.").message
          )
          return
        }

        collectMessage(path, props, ctx)
      },

      // Extract message descriptors
      ObjectExpression(path, ctx) {
        if (!hasI18nComment(path.node)) return

        const props = extractFromObjectExpression(t, path.node, ctx.file.hub, [
          "id",
          "message",
          "comment",
          "context",
        ])

        if (!props.id) {
          console.warn(
            path.buildCodeFrameError("Missing message ID, skipping.").message
          )
          return
        }

        collectMessage(path, props, ctx)
      },
    },
  }
}

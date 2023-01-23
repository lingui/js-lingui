import type * as BabelTypesNamespace from "@babel/types"
import {
  Expression,
  Identifier,
  ImportSpecifier,
  JSXAttribute,
  Node,
  ObjectExpression,
  ObjectProperty,
  StringLiteral,
} from "@babel/types"
import type { PluginObj, PluginPass } from "@babel/core"
import { NodePath } from "@babel/core"
import { Hub } from "@babel/traverse"

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

export type Origin = [filename: string, line: number]

function collectMessage(
  path: NodePath<any>,
  props: RawMessage,
  ctx: PluginPass
) {
  // prevent from adding undefined msgid
  if (props.id === undefined) return

  const line = path.node.loc ? path.node.loc.start.line : null

  ;(ctx.opts as ExtractPluginOpts).onMessageExtracted({
    id: props.id,
    message: props.message,
    context: props.context,
    comment: props.comment,
    origin: [ctx.file.opts.filename, line],
  })
}

function getTextFromExpression(
  t: BabelTypes,
  exp: Expression,
  hub: Hub
): string {
  if (t.isStringLiteral(exp)) {
    return exp.value
  }

  if (t.isBinaryExpression(exp)) {
    return (
      getTextFromExpression(t, exp.left as Expression, hub) +
      getTextFromExpression(t, exp.right as Expression, hub)
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

  console.warn(
    hub.buildError(
      exp,
      "Only strings or template literals could be extracted.",
      SyntaxError
    ).message
  )
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

  // We need to remember all processed nodes. When JSX expressions are
  // replaced with CallExpressions, all children are traversed for each CallExpression.
  // Then, i18n._ methods are visited multiple times for each parent CallExpression.
  const visitedNodes = new WeakSet<Node>()

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
        if (visitedNodes.has(path.node)) return

        const hasComment = [path.node, path.parent].some((node) =>
          hasI18nComment(node)
        )

        const firstArgument = path.node.arguments[0]

        // support `i18n._` calls written by users in form i18n._(id, variables, descriptor)
        // without explicit annotation with comment
        // calls generated by macro has a form i18n._(/*i18n*/ {descriptor}) and
        // processed by ObjectExpression visitor
        const isNonMacroI18n =
          isI18nMethod(path.node.callee) && !firstArgument?.leadingComments
        if (!hasComment && !isNonMacroI18n) return

        let props: Record<string, unknown> = {
          id: (firstArgument as StringLiteral).value,
        }

        if (!props.id) {
          // don't rise warning when translating from variables
          if (!t.isIdentifier(firstArgument)) {
            console.warn(
              path.buildCodeFrameError("Missing message ID, skipping.").message
            )
          }
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

        visitedNodes.add(path.node)
        collectMessage(path, props, ctx)
      },

      StringLiteral(path, ctx) {
        if (!hasI18nComment(path.node) || visitedNodes.has(path.node)) {
          return
        }

        visitedNodes.add(path.node)

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
        if (!hasI18nComment(path.node) || visitedNodes.has(path.node)) {
          return
        }

        visitedNodes.add(path.node)

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

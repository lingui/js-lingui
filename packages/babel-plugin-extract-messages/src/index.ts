import type * as BabelTypesNamespace from "@babel/types"
import {
  Expression,
  Identifier,
  JSXAttribute,
  Node,
  ObjectExpression,
  ObjectProperty,
} from "@babel/types"
import type { PluginObj, PluginPass, NodePath } from "@babel/core"
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

const I18N_OBJECT = "i18n"

function hasComment(node: Node, comment: string): boolean {
  return (
    node.leadingComments &&
    node.leadingComments.some((comm) => comm.value.trim() === comment)
  )
}

function hasIgnoreComment(node: Node): boolean {
  return hasComment(node, "lingui-extract-ignore")
}

function hasI18nComment(node: Node): boolean {
  return hasComment(node, "i18n")
}

export default function ({ types: t }: { types: BabelTypes }): PluginObj {
  function isTransComponent(path: NodePath) {
    return (
      path.isJSXElement() &&
      path
        .get("openingElement")
        .get("name")
        .referencesImport("@lingui/react", "Trans")
    )
  }

  const isI18nMethod = (node: Node) =>
    t.isMemberExpression(node) &&
    (t.isIdentifier(node.object, { name: I18N_OBJECT }) ||
      (t.isMemberExpression(node.object) &&
        t.isIdentifier(node.object.property, { name: I18N_OBJECT }))) &&
    (t.isIdentifier(node.property, { name: "_" }) ||
      t.isIdentifier(node.property, { name: "t" }))

  const extractFromMessageDescriptor = (
    path: NodePath<ObjectExpression>,
    ctx: PluginPass
  ) => {
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
  }

  return {
    visitor: {
      // Extract translation from <Trans /> component.
      JSXElement(path, ctx) {
        const { node } = path
        if (!isTransComponent(path)) return

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
        if ([path.node, path.parent].some((node) => hasIgnoreComment(node))) {
          return
        }

        const firstArgument = path.get("arguments")[0]

        // i18n._(...)
        if (!isI18nMethod(path.node.callee)) {
          return
        }

        // call with explicit annotation
        // i18n._(/*i18n*/ {descriptor})
        // skipping this as it is processed
        // by ObjectExpression visitor
        if (hasI18nComment(firstArgument.node)) {
          return
        }

        if (firstArgument.isObjectExpression()) {
          // i8n._({message, id, context})
          extractFromMessageDescriptor(firstArgument, ctx)
          return
        } else {
          // i18n._(id, variables, descriptor)
          let props = {
            id: getTextFromExpression(
              t,
              firstArgument.node as Expression,
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
        }
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

        extractFromMessageDescriptor(path, ctx)
      },
    },
  }
}

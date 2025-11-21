import type * as BabelTypesNamespace from "@babel/types"
import type {
  Expression,
  Identifier,
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
  placeholders?: Record<string, string>
}

export type ExtractPluginOpts = {
  onMessageExtracted(msg: ExtractedMessage): void
}

type RawMessage = {
  id?: string
  message?: string
  comment?: string
  context?: string
  placeholders?: Record<string, string>
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

  const line = node.loc ? node.loc.start.line : undefined
  const column = node.loc ? node.loc.start.column : undefined

  ;(ctx.opts as ExtractPluginOpts).onMessageExtracted({
    id: props.id,
    message: props.message,
    context: props.context,
    comment: props.comment,
    placeholders: props.placeholders || {},
    origin: ctx.file.opts.filename
      ? ([ctx.file.opts.filename, line, column] as Origin)
      : undefined,
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

    return exp.quasis[0]?.value?.cooked || ""
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

  return ""
}

function getNodeSource(fileContents: string, node: Node) {
  return fileContents.slice(node.start!, node.end!)
}

function valuesObjectExpressionToPlaceholdersRecord(
  t: BabelTypes,
  exp: ObjectExpression,
  hub: Hub
) {
  const props: Record<string, string> = {}

  ;(exp.properties as ObjectProperty[]).forEach(({ key, value }, i) => {
    let name: string | undefined

    if (t.isStringLiteral(key) || t.isNumericLiteral(key)) {
      name = key.value.toString()
    } else if (t.isIdentifier(key)) {
      name = key.name
    } else {
      console.warn(
        hub.buildError(
          exp,
          `Could not extract values to placeholders. The key #${i} has unsupported syntax`,
          SyntaxError
        ).message
      )
    }

    if (name) {
      props[name] = getNodeSource(hub.getCode()!, value)
    }
  })

  return props
}

function extractFromObjectExpression(
  t: BabelTypes,
  exp: ObjectExpression,
  hub: Hub
) {
  const props: RawMessage = {}

  const textKeys = ["id", "message", "comment", "context"] as const

  ;(exp.properties as ObjectProperty[]).forEach(({ key, value }, i) => {
    const name = (key as Identifier).name

    if (name === "values" && t.isObjectExpression(value)) {
      props.placeholders = valuesObjectExpressionToPlaceholdersRecord(
        t,
        value,
        hub
      )
    } else if (textKeys.includes(name as any)) {
      props[name as (typeof textKeys)[number]] = getTextFromExpression(
        t,
        value as Expression,
        hub
      )
    }
  })

  return props
}

const I18N_OBJECT = "i18n"

function hasComment(node: Node, comment: string): boolean {
  return !!node.leadingComments?.some((comm) => comm.value.trim() === comment)
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
    const props = extractFromObjectExpression(t, path.node, ctx.file.hub)

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

        const attrs = node.openingElement.attributes || []

        if (
          attrs.find(
            (attr) =>
              t.isJSXSpreadAttribute(attr) && hasI18nComment(attr.argument)
          )
        ) {
          return
        }

        const props = attrs.reduce<RawMessage>((acc, item) => {
          if (t.isJSXSpreadAttribute(item)) {
            return acc
          }

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

          if (
            key === "values" &&
            t.isJSXExpressionContainer(item.value) &&
            t.isObjectExpression(item.value.expression)
          ) {
            acc.placeholders = valuesObjectExpressionToPlaceholdersRecord(
              t,
              item.value.expression,
              ctx.file.hub
            )
          }

          return acc
        }, {})

        if (!props.id) {
          // <Trans id={message} /> is valid, don't raise warning
          const idProp = attrs.filter(
            (item) => t.isJSXAttribute(item) && item.name.name === "id"
          )[0]
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
          let props: RawMessage = {
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

          const secondArgument = path.node.arguments[1]
          if (secondArgument && t.isObjectExpression(secondArgument)) {
            props.placeholders = valuesObjectExpressionToPlaceholdersRecord(
              t,
              secondArgument,
              ctx.file.hub
            )
          }

          const msgDescArg = path.node.arguments[2]

          if (t.isObjectExpression(msgDescArg)) {
            props = {
              ...props,
              ...extractFromObjectExpression(t, msgDescArg, ctx.file.hub),
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

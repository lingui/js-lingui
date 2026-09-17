import {
  ElementTypes,
  NodeTypes,
  createSimpleExpression,
  type AttributeNode,
  type CompilerError,
  type DirectiveNode,
  type ElementNode,
  type ExpressionNode,
  type NodeTransform,
  type RootNode,
  type SourceLocation,
  type TemplateChildNode,
  type TransformContext,
} from "@vue/compiler-core"
import {
  parse as parseProgram,
  parseExpression,
  type ParserPlugin,
} from "@babel/parser"
import _generate from "@babel/generator"
import * as t from "@babel/types"
import { escapeRegExp } from "../utils"

// CJS/ESM interop: `@babel/generator` exposes the function on `default` when
// imported from an ESM build.
const generate: typeof _generate =
  (_generate as unknown as { default?: typeof _generate }).default ?? _generate

// Keep generated descriptors on a single line: Vue's codegen maps only the
// start of an inserted expression back to the template, and the extractor
// needs the `/** i18n */` object to stay on that mapped line for its origin.
const generateOptions = { comments: true, compact: true } as const
import {
  ICUMessageFormat,
  createMacroJsContext,
  createMessageDescriptor,
  createMessageDescriptorFromTokens,
  isI18nMethod,
  processDescriptor,
  tokenizeExpression,
  tokenizeNode,
  tokenizeTemplateLiteral,
  type ArgToken,
  type ElementToken,
  type MacroJsContext,
  type ResolvedDescriptorFields,
  type TextWithLoc,
  type Token,
} from "@lingui/babel-plugin-lingui-macro/ast"

export type DescriptorFieldsMode = "auto" | "all" | "id-only" | "message"

type JsxMacroName = "Trans" | "Plural" | "Select" | "SelectOrdinal"

export type LinguiTemplateTransformOptions = {
  /**
   * Controls which descriptor fields are preserved in the compiled template.
   *
   * - `"auto"` (default): In production (`NODE_ENV === "production"`), keeps only the `id`.
   *    Otherwise, behaves like `"all"`.
   * - `"all"`: Keeps every field: `id`, `message`, `context`, and `comment`.
   *    Used during extraction.
   * - `"id-only"`: Strips everything except the `id`.
   * - `"message"`: Keeps `id`, `message`, and `context` (but not `comment`).
   *
   * @default "auto"
   */
  descriptorFields?: DescriptorFieldsMode
  /**
   * Tag names of the macro components in templates.
   *
   * Matching is case-insensitive and accepts kebab-case
   * (`<select-ordinal>` matches `SelectOrdinal`).
   */
  tags?: Partial<Record<JsxMacroName, string>>
  /**
   * Names of the JS macros recognized inside template expressions.
   */
  macroNames?: Partial<
    Record<"t" | "plural" | "select" | "selectOrdinal" | "ph", string>
  >
  /**
   * Same as `macro.jsxPlaceholderAttribute` in Lingui config.
   */
  placeholderAttribute?: string
  /**
   * Same as `macro.jsxPlaceholderDefaults` in Lingui config.
   */
  placeholderDefaults?: Record<string, string>
  /**
   * Same as `macro.idPrefixLeader` in Lingui config.
   */
  idPrefixLeader?: string
}

export const LINGUI_TRANSFORM_MARKER = Symbol.for("@lingui/vue/template")

const defaultTags: Record<JsxMacroName, string> = {
  Trans: "Trans",
  Plural: "Plural",
  Select: "Select",
  SelectOrdinal: "SelectOrdinal",
}

const defaultMacroNames: Record<
  "t" | "plural" | "select" | "selectOrdinal" | "ph",
  string
> = {
  t: "t",
  plural: "plural",
  select: "select",
  selectOrdinal: "selectOrdinal",
  ph: "ph",
}

const pluralRuleRe = /^(_[\d\w]+|zero|one|two|few|many|other)$/
const choiceAttributeRe =
  /^(_[\d\w]+|zero|one|two|few|many|other|value|offset)$/
const jsx2icuExactChoice = (value: string) =>
  value.replace(/_(\d+)/, "=$1").replace(/_(\w+)/, "$1")

const reservedAttributes = ["id", "message", "comment", "context"]

const structuralDirectives = ["if", "else", "else-if", "for", "slot"]

// vite-plugin-vue-inspector (bundled in vite-plugin-vue-devtools) rewrites the
// template source in dev and adds this attribute to every element. Two
// elements that only differ by it are still the same placeholder.
const injectedAttributes = new Set(["data-v-inspector"])

type ResolvedOptions = {
  descriptorFields: ResolvedDescriptorFields
  tags: Record<string, JsxMacroName>
  macroNames: typeof defaultMacroNames
  macroRe: RegExp
  placeholderAttribute?: string
  placeholderDefaults?: Record<string, string>
  idPrefixLeader?: string
}

type MacroState = {
  ctx: MacroJsContext
  elementIndex: () => number
  elementsTracking: Map<string, ElementNode>
  context: TransformContext
}

const makeCounter =
  (index = 0) =>
  () =>
    index++

const normalizeTag = (tag: string) =>
  tag
    .replace(/-(\w)/g, (_, c: string) => c.toUpperCase())
    .replace(/^\w/, (c) => c.toUpperCase())

function resolveDescriptorFields(
  mode: DescriptorFieldsMode = "auto",
): ResolvedDescriptorFields {
  if (mode === "auto") {
    return process.env.NODE_ENV === "production" ? "id-only" : "all"
  }
  return mode
}

function resolveOptions(
  options: LinguiTemplateTransformOptions,
): ResolvedOptions {
  const tagOptions = { ...defaultTags, ...options.tags }
  const tags: Record<string, JsxMacroName> = {}
  for (const [macro, tag] of Object.entries(tagOptions)) {
    tags[normalizeTag(tag)] = macro as JsxMacroName
  }

  const macroNames = { ...defaultMacroNames, ...options.macroNames }
  const tName = escapeRegExp(macroNames.t)

  return {
    descriptorFields: resolveDescriptorFields(options.descriptorFields),
    tags,
    macroNames,
    // `t\`...\`` or `t({...})`
    macroRe: new RegExp(`\\b${tName}\\s*(\`|\\(\\s*\\{)`),
    placeholderAttribute: options.placeholderAttribute,
    placeholderDefaults: options.placeholderDefaults,
    idPrefixLeader: options.idPrefixLeader,
  }
}

function fail(
  context: TransformContext,
  message: string,
  loc?: SourceLocation,
): void {
  const error = new SyntaxError(`[lingui] ${message}`) as CompilerError
  error.code = 1000
  error.loc = loc
  context.onError(error)
}

function isElement(node: TemplateChildNode): node is ElementNode {
  return node.type === NodeTypes.ELEMENT
}

function isDirective(
  prop: AttributeNode | DirectiveNode,
): prop is DirectiveNode {
  return prop.type === NodeTypes.DIRECTIVE
}

function getStaticArg(dir: DirectiveNode): string | undefined {
  const arg = dir.arg
  if (arg && arg.type === NodeTypes.SIMPLE_EXPRESSION && arg.isStatic) {
    return arg.content
  }
  return undefined
}

function getStaticText(
  el: ElementNode,
  name: string,
  context: TransformContext,
): TextWithLoc | undefined {
  for (const prop of el.props) {
    if (isDirective(prop)) {
      if (prop.name === "bind" && getStaticArg(prop) === name) {
        fail(
          context,
          `The \`${name}\` attribute of <${el.tag}> must be a static string`,
          prop.loc,
        )
      }
      continue
    }

    if (prop.name === name) {
      return { text: prop.value?.content ?? "" }
    }
  }
  return undefined
}

function getStaticAttribute(
  el: ElementNode,
  name: string,
): AttributeNode | undefined {
  return el.props.find(
    (prop): prop is AttributeNode =>
      !isDirective(prop) && prop.name === name && prop.value !== undefined,
  )
}

/**
 * Whether the children of a `<Trans>` form a message. Whitespace, comments
 * and named slots (`<template #link>` for a `<link>` placeholder) don't.
 */
function hasMessageContent(el: ElementNode): boolean {
  return el.children.some((child) => {
    switch (child.type) {
      case NodeTypes.TEXT:
        return child.content.trim() !== ""
      case NodeTypes.COMMENT:
        return false
      case NodeTypes.ELEMENT:
        return getSlotName(child) === undefined
      default:
        return true
    }
  })
}

function hasStructuralDirective(el: ElementNode): boolean {
  return el.props.some(
    (prop) => isDirective(prop) && structuralDirectives.includes(prop.name),
  )
}

function getSlotName(el: ElementNode): string | undefined {
  for (const prop of el.props) {
    if (isDirective(prop) && prop.name === "slot") {
      return getStaticArg(prop) ?? "default"
    }
  }
  return undefined
}

function createSlotTemplate(
  name: string,
  node: ElementNode,
  parent: ElementNode,
): ElementNode {
  const loc = node.loc

  return {
    type: NodeTypes.ELEMENT,
    ns: parent.ns,
    tag: "template",
    tagType: ElementTypes.TEMPLATE,
    props: [
      {
        type: NodeTypes.DIRECTIVE,
        name: "slot",
        rawName: "v-slot",
        arg: createSimpleExpression(name, true, loc),
        exp: undefined,
        modifiers: [],
        loc,
      } as DirectiveNode,
    ],
    isSelfClosing: false,
    children: [node],
    loc,
    codegenNode: undefined,
  } as ElementNode
}

function getObjectProperty(
  obj: t.ObjectExpression,
  name: string,
): t.ObjectProperty | undefined {
  return obj.properties.find(
    (prop): prop is t.ObjectProperty =>
      t.isObjectProperty(prop) &&
      (t.isIdentifier(prop.key, { name }) ||
        t.isStringLiteral(prop.key, { value: name })),
  )
}

function createBindDirective(
  content: string,
  loc: SourceLocation,
): DirectiveNode {
  return {
    type: NodeTypes.DIRECTIVE,
    name: "bind",
    rawName: "v-bind",
    arg: undefined,
    exp: createSimpleExpression(content, false, loc),
    modifiers: [],
    loc,
  } as DirectiveNode
}

/**
 * Vue template compiler transform that compiles Lingui macros in templates:
 *
 * - `<Trans>Hello <a href="/docs">docs</a></Trans>`
 * - `<Plural :value="count" one="Book" other="Books" />`
 * - `<Select :value="gender" _male="His" _female="Her" other="Their" />`
 * - `<SelectOrdinal :value="n" one="#st" two="#nd" few="#rd" other="#th" />`
 * - `` t`Hello {name}` `` and `t({ message: "..." })` in interpolations, bound
 *   attributes, `v-on` handlers and `v-for` sources
 *
 * into their runtime counterparts with precomputed message IDs.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import vue from "@vitejs/plugin-vue"
 * import { linguiTemplateTransform } from "@lingui/vue/compiler"
 *
 * vue({
 *   template: {
 *     compilerOptions: {
 *       nodeTransforms: [linguiTemplateTransform()],
 *     },
 *   },
 * })
 * ```
 */
export function linguiTemplateTransform(
  options: LinguiTemplateTransformOptions = {},
): NodeTransform {
  const opts = resolveOptions(options)
  const processed = new WeakSet<object>()

  const transform: NodeTransform = (node, context) => {
    // Built-in transforms run before user transforms on every node, so a node
    // must be rewritten while its parent is entered, before it is traversed.
    if (!("children" in node) || !Array.isArray(node.children)) {
      return
    }

    for (const child of (node as RootNode | ElementNode).children) {
      if (typeof child !== "object" || processed.has(child)) {
        continue
      }
      processed.add(child)

      if (child.type === NodeTypes.INTERPOLATION) {
        child.content = rewriteExpression(child.content, context, opts)
      } else if (isElement(child)) {
        const macro = getMacroKind(child, opts)

        if (macro) {
          compileMacroElement(child, macro, context, opts)
        } else {
          if (
            child.tagType === ElementTypes.COMPONENT &&
            opts.tags[normalizeTag(child.tag)] === "Trans"
          ) {
            compileRuntimeTrans(child, opts)
          }
          rewriteElementProps(child, context, opts)
        }
      }
    }
  }

  return Object.assign(transform, { [LINGUI_TRANSFORM_MARKER]: true })
}

export function isLinguiTemplateTransform(transform: unknown): boolean {
  return (
    typeof transform === "function" &&
    (transform as unknown as Record<symbol, unknown>)[
      LINGUI_TRANSFORM_MARKER
    ] === true
  )
}

function getMacroKind(
  el: ElementNode,
  opts: ResolvedOptions,
): JsxMacroName | undefined {
  if (el.tagType !== ElementTypes.COMPONENT) {
    return undefined
  }

  const kind = opts.tags[normalizeTag(el.tag)]

  if (!kind) {
    return undefined
  }

  if (kind === "Trans") {
    // <Trans id="..." message="..." /> without message content is a runtime
    // usage, its static descriptor attributes are folded by `compileRuntimeTrans`
    return hasMessageContent(el) ? kind : undefined
  }

  // Choice components must have the `other` attribute, other components with
  // the same name (e.g. a UI library `<Select>`) are left untouched.
  const hasOther = el.props.some(
    (prop) =>
      (!isDirective(prop) && prop.name === "other") ||
      (isDirective(prop) &&
        (prop.name === "bind" || prop.name === "slot") &&
        getStaticArg(prop) === "other"),
  )
  const hasOtherSlot = el.children.some(
    (child) => isElement(child) && getSlotName(child) === "other",
  )

  return hasOther || hasOtherSlot ? kind : undefined
}

function rewriteElementProps(
  el: ElementNode,
  context: TransformContext,
  opts: ResolvedOptions,
) {
  for (const prop of el.props) {
    if (!isDirective(prop) || !prop.exp || prop.name === "slot") {
      continue
    }

    if (prop.name === "for") {
      rewriteForSource(prop, context, opts)
      continue
    }

    prop.exp = rewriteExpression(prop.exp, context, opts)
  }
}

/**
 * `item in items` is not a JS expression, only its iterated source is.
 * The parser splits it while parsing and `transformFor` only reads that
 * result, which it also requires: a missing one is already an error there.
 */
function rewriteForSource(
  dir: DirectiveNode,
  context: TransformContext,
  opts: ResolvedOptions,
) {
  const exp = dir.exp
  if (!exp || exp.type !== NodeTypes.SIMPLE_EXPRESSION) {
    return
  }

  const parsed = dir.forParseResult
  if (!parsed) {
    return
  }

  parsed.source = rewriteExpression(parsed.source, context, opts)
}

function getParserPlugins(context: TransformContext): ParserPlugin[] {
  const plugins: ParserPlugin[] = [...(context.expressionPlugins || [])]
  if (context.isTS && !plugins.includes("typescript")) {
    plugins.push("typescript")
  }
  return plugins
}

function createMacroState(
  context: TransformContext,
  opts: ResolvedOptions,
): MacroState {
  const macroNames = opts.macroNames

  // `JsMacroName` values match the `macroNames` keys; macros without a
  // template counterpart (`msg`, `defineMessage`, ...) are not recognized.
  const isLinguiIdentifier: MacroJsContext["isLinguiIdentifier"] = (
    node,
    macro,
  ) => {
    return (
      Object.hasOwn(macroNames, macro) &&
      node.name === macroNames[macro as keyof typeof macroNames]
    )
  }

  const ctx = createMacroJsContext(t, isLinguiIdentifier, opts.descriptorFields)
  ctx.idPrefixLeader = opts.idPrefixLeader

  return {
    ctx,
    elementIndex: makeCounter(),
    elementsTracking: new Map(),
    context,
  }
}

function parse(
  source: string,
  context: TransformContext,
  loc: SourceLocation,
): t.Expression | undefined {
  try {
    return parseExpression(source, {
      plugins: getParserPlugins(context),
    })
  } catch (e) {
    fail(
      context,
      `Could not parse expression \`${source}\`: ${(e as Error).message}`,
      loc,
    )
    return undefined
  }
}

type BabelVisitor = (node: t.Node) => t.Node

/**
 * Post-order traversal replacing nodes with the visitor result.
 */
function walk(node: t.Node, visitor: BabelVisitor): t.Node {
  const keys = t.VISITOR_KEYS[node.type] || []

  for (const key of keys) {
    const child = (node as unknown as Record<string, unknown>)[key]

    if (Array.isArray(child)) {
      ;(node as unknown as Record<string, unknown>)[key] = child.map((item) =>
        item && typeof item === "object" && "type" in item
          ? walk(item as t.Node, visitor)
          : item,
      )
    } else if (child && typeof child === "object" && "type" in child) {
      ;(node as unknown as Record<string, unknown>)[key] = walk(
        child as t.Node,
        visitor,
      )
    }
  }

  return visitor(node)
}

/**
 * Rewrites `t\`...\`` and `t({...})` in a template expression into
 * `t({ id, message, values })` runtime calls.
 */
function rewriteExpression(
  exp: ExpressionNode,
  context: TransformContext,
  opts: ResolvedOptions,
): ExpressionNode {
  if (
    exp.type !== NodeTypes.SIMPLE_EXPRESSION ||
    exp.isStatic ||
    !opts.macroRe.test(exp.content)
  ) {
    return exp
  }

  const plugins = getParserPlugins(context)
  let ast: t.Expression | t.Program
  let isStatements = false
  try {
    ast = parseExpression(exp.content, { plugins })
  } catch {
    // Not an expression, e.g. a `v-on` handler with several statements.
    try {
      ast = parseProgram(exp.content, { plugins }).program
      isStatements = true
    } catch {
      // Leave the parse error to the Vue compiler
      return exp
    }
  }

  const { macroNames, descriptorFields, idPrefixLeader } = opts
  let changed = false
  let failed = false

  // Shared context for detection only; each matched macro gets its own
  // context below so positional placeholders restart at `{0}`.
  const { ctx: detectCtx } = createMacroState(context, opts)

  // t`Hello ${name}`
  const rewriteTaggedTemplate = (node: t.Node): t.Node => {
    const { ctx } = createMacroState(context, opts)
    const descriptor = createMessageDescriptorFromTokens(
      t,
      tokenizeTemplateLiteral(node as t.Expression, ctx),
      node.loc as t.SourceLocation,
      descriptorFields,
      { idPrefixLeader },
    )

    return t.callExpression(t.identifier(macroNames.t), [descriptor])
  }

  // t({ message: `Hello ${name}`, comment: "..." })
  const rewriteDescriptorCall = (node: t.CallExpression): t.Node => {
    const original = node.arguments[0] as t.ObjectExpression
    const message = getObjectProperty(original, "message")

    // Macros are matched by name only: a call without `id` or `message` is
    // not a Lingui descriptor (e.g. `t({ path })` of another i18n library).
    if (!message && !getObjectProperty(original, "id")) {
      return node
    }

    if (message) {
      const { ctx: probe } = createMacroState(context, opts)
      const value = message.value
      if (
        !t.isTemplateLiteral(value) &&
        !tokenizeNode(value as t.Expression, true, probe)
      ) {
        throw new Error(
          "The `message` of a descriptor must be a string literal, a template literal or a macro call",
        )
      }
    }

    const { ctx } = createMacroState(context, opts)
    const descriptor = processDescriptor(original, ctx)

    // `processDescriptor` only keeps values derived from the message,
    // re-attach explicit `values` of runtime-style descriptors.
    if (!getObjectProperty(descriptor, "values")) {
      const values = getObjectProperty(original, "values")
      if (values) {
        descriptor.properties.push(values)
      }
    }

    return t.callExpression(node.callee, [
      descriptor,
      ...node.arguments.slice(1),
    ])
  }

  const result = walk(ast, (node) => {
    try {
      if (isI18nMethod(node, detectCtx)) {
        const rewritten = rewriteTaggedTemplate(node)
        changed = true
        return rewritten
      }

      if (
        t.isCallExpression(node) &&
        t.isIdentifier(node.callee, { name: macroNames.t }) &&
        t.isObjectExpression(node.arguments[0])
      ) {
        const rewritten = rewriteDescriptorCall(node)
        changed = changed || rewritten !== node
        return rewritten
      }
    } catch (e) {
      // The macro AST helpers throw plain errors on unsupported usage,
      // report them as compiler errors instead of crashing the build.
      failed = true
      fail(context, `Unsupported macro usage: ${(e as Error).message}`, exp.loc)
    }

    return node
  })

  if (!changed || failed) {
    return exp
  }

  const code = generate(result, generateOptions).code
  const rewritten = createSimpleExpression(code, false, exp.loc)

  if (isStatements) {
    // Vue's parser pre-parses statement handlers and `processExpression` can
    // only prefix identifiers from that AST, it re-parses expressions only.
    // Mirror the parser: a leading space keeps node offsets 1-based.
    rewritten.ast = parseProgram(` ${code} `, { plugins }).program
  }

  return rewritten
}

/**
 * Compiles `<Trans>`, `<Plural>`, `<Select>` and `<SelectOrdinal>` elements in
 * place into runtime `<Trans>` usage with a precomputed message descriptor
 * and indexed named slots for inline elements.
 */
function compileMacroElement(
  el: ElementNode,
  kind: JsxMacroName,
  context: TransformContext,
  opts: ResolvedOptions,
) {
  const state = createMacroState(context, opts)

  let parsed: ReturnType<ICUMessageFormat["fromTokens"]>

  try {
    const tokens =
      kind === "Trans"
        ? trimTokens(tokenizeChildren(el.children, state, opts))
        : [tokenizeChoiceElement(el, kind, state, opts)]

    if (!tokens.length) {
      fail(context, `Incorrect usage of <${el.tag}>`, el.loc)
      return
    }

    parsed = new ICUMessageFormat().fromTokens(tokens)
  } catch (e) {
    // The macro AST helpers throw plain errors on unsupported usage,
    // report them as compiler errors instead of crashing the build.
    fail(
      context,
      `Unsupported usage of <${el.tag}>: ${(e as Error).message}`,
      el.loc,
    )
    return
  }

  const { message, values, elements } = parsed
  const id = getStaticText(el, "id", context)
  const comment = getStaticText(el, "comment", context)
  const messageContext = getStaticText(el, "context", context)

  const descriptor = createMessageDescriptor(
    t,
    { message, values },
    undefined as unknown as t.SourceLocation,
    opts.descriptorFields,
    {
      id,
      comment,
      context: messageContext,
      idPrefixLeader: opts.idPrefixLeader,
    },
  )

  const code = generate(descriptor, generateOptions).code

  const reserved =
    kind === "Trans"
      ? (name: string) => reservedAttributes.includes(name)
      : (name: string) =>
          reservedAttributes.includes(name) || choiceAttributeRe.test(name)

  el.props = el.props.filter((prop) => {
    const name = isDirective(prop)
      ? prop.name === "bind"
        ? getStaticArg(prop)
        : undefined
      : prop.name
    return name === undefined || !reserved(name)
  })
  // Remaining props (`:title`, `@click`, `v-for`, ...) may use `t` too
  rewriteElementProps(el, context, opts)
  el.props.push(createBindDirective(code, el.loc))

  el.children = Object.entries(elements || {}).map(([name, node]) =>
    createSlotTemplate(name, node as ElementNode, el),
  )
  el.isSelfClosing = el.children.length === 0
}

/**
 * Folds the static `id`, `message`, `comment` and `context` attributes of a
 * runtime `<Trans id="..." message="..." />` usage into a message descriptor,
 * so the message is extracted and the fields are stripped in production like
 * for the macro form. Bound attributes, `values`, `components` and named
 * slots are left untouched.
 */
function compileRuntimeTrans(el: ElementNode, opts: ResolvedOptions) {
  const id = getStaticAttribute(el, "id")
  const message = getStaticAttribute(el, "message")

  // Nothing to extract from a fully dynamic usage
  if (!id && !message) {
    return
  }

  // The descriptor would override a dynamic `:id`, or hash an id without
  // the dynamic `:message` or `:context`, leave such usage to the runtime.
  // With a static id, a dynamic message or context only stays a runtime prop.
  const isBound = (name: string) =>
    el.props.some(
      (prop) =>
        isDirective(prop) &&
        prop.name === "bind" &&
        getStaticArg(prop) === name,
    )
  if (isBound("id") || (!id && (isBound("message") || isBound("context")))) {
    return
  }

  const comment = getStaticAttribute(el, "comment")
  const messageContext = getStaticAttribute(el, "context")
  const toText = (attr?: AttributeNode): TextWithLoc | undefined =>
    attr ? { text: attr.value!.content } : undefined

  const descriptor = createMessageDescriptor(
    t,
    { message: message?.value!.content },
    undefined as unknown as t.SourceLocation,
    opts.descriptorFields,
    {
      id: toText(id),
      comment: toText(comment),
      context: toText(messageContext),
      idPrefixLeader: opts.idPrefixLeader,
    },
  )

  const folded = new Set([id, message, comment, messageContext])
  el.props = el.props.filter((prop) => !folded.has(prop as AttributeNode))
  el.props.push(
    createBindDirective(generate(descriptor, generateOptions).code, el.loc),
  )
}

function trimTokens(tokens: Token[]): Token[] {
  const first = tokens[0]
  if (first && first.type === "text") {
    first.value = first.value.replace(/^\s+/, "")
  }
  const last = tokens[tokens.length - 1]
  if (last && last.type === "text") {
    last.value = last.value.replace(/\s+$/, "")
  }
  return tokens.filter((token) => token.type !== "text" || token.value !== "")
}

function tokenizeChildren(
  children: TemplateChildNode[],
  state: MacroState,
  opts: ResolvedOptions,
): Token[] {
  const tokens: Token[] = []

  for (const child of children) {
    switch (child.type) {
      case NodeTypes.TEXT:
        tokens.push({ type: "text", value: child.content })
        break

      case NodeTypes.INTERPOLATION: {
        const content = child.content
        if (content.type !== NodeTypes.SIMPLE_EXPRESSION) {
          break
        }
        const expression = parse(content.content, state.context, child.loc)
        if (!expression) {
          break
        }
        tokens.push(...tokenizeExpressionNode(expression, state))
        break
      }

      case NodeTypes.ELEMENT:
        tokens.push(...tokenizeElementNode(child, state, opts))
        break

      case NodeTypes.COMMENT:
        break

      default:
        fail(state.context, `Unsupported node inside <Trans>`, child.loc)
    }
  }

  return tokens
}

function tokenizeExpressionNode(
  expression: t.Expression,
  state: MacroState,
): Token[] {
  // {{ `Hello ${name}` }}
  if (t.isTemplateLiteral(expression)) {
    return tokenizeTemplateLiteral(expression, state.ctx)
  }

  // {{ "text" }}, {{ t`...` }}, {{ plural(...) }}, {{ ph({...}) }}, {{ name }}
  return tokenizeNode(expression, false, state.ctx) ?? []
}

function tokenizeElementNode(
  el: ElementNode,
  state: MacroState,
  opts: ResolvedOptions,
): Token[] {
  const kind = getMacroKind(el, opts)

  if (kind === "Trans") {
    // nested <Trans> is flattened into the parent message
    return tokenizeChildren(el.children, state, opts)
  }

  if (kind) {
    return [tokenizeChoiceElement(el, kind, state, opts)]
  }

  if (
    el.tagType === ElementTypes.TEMPLATE ||
    el.tagType === ElementTypes.SLOT
  ) {
    fail(
      state.context,
      `<${el.tag}> can't be used inside <Trans>. Move it outside of the message.`,
      el.loc,
    )
    return []
  }

  if (hasStructuralDirective(el)) {
    fail(
      state.context,
      `Structural directives (v-if, v-for, v-slot) can't be used on elements inside <Trans>. Move the condition or loop outside of the message.`,
      el.loc,
    )
    return []
  }

  return [tokenizeElement(el, state, opts)]
}

function tokenizeElement(
  el: ElementNode,
  state: MacroState,
  opts: ResolvedOptions,
): ElementToken {
  const { placeholderAttribute, placeholderDefaults } = opts
  const { elementsTracking, context } = state

  let props = el.props
  let name: string | undefined = undefined

  if (placeholderAttribute) {
    const attrIndex = props.findIndex(
      (prop) => !isDirective(prop) && prop.name === placeholderAttribute,
    )

    if (attrIndex !== -1) {
      const attr = props[attrIndex] as AttributeNode
      if (!attr.value?.content) {
        fail(
          context,
          `The \`${placeholderAttribute}\` attribute must be a non-empty string.`,
          attr.loc,
        )
      } else {
        name = attr.value.content
      }

      props = props.filter((_, index) => index !== attrIndex)
    }
  }

  if (!name && placeholderDefaults) {
    name = placeholderDefaults[el.tag]
  }

  const node: ElementNode = {
    ...el,
    props,
    children: [],
    isSelfClosing: true,
    codegenNode: undefined,
  }

  if (!name) {
    name = String(state.elementIndex())
    elementsTracking.set(name, node)
  } else {
    if (/^\d+$/.test(name)) {
      fail(
        context,
        `Placeholder name \`${name}\` is not allowed because it conflicts with auto-generated numeric placeholders. Use a non-numeric name instead.`,
        el.loc,
      )
    } else if (!/^[a-zA-Z_]([\w.-]*\w)?$/.test(name)) {
      fail(
        context,
        `Placeholder name \`${name}\` is not valid. Names must start and end with a letter/digit/underscore, but may contain \`.-\` in between.`,
        el.loc,
      )
    }

    const existingElement = elementsTracking.get(name)

    if (existingElement) {
      const serialize = (element: ElementNode) =>
        element.tag +
        element.props
          .filter(
            (prop) => isDirective(prop) || !injectedAttributes.has(prop.name),
          )
          .map((prop) => prop.loc.source)
          .sort()
          .join(" ")

      if (serialize(existingElement) !== serialize(node)) {
        const eg = `(e.g. \`<element ${placeholderAttribute || "_t"}="newName" />\`)`
        fail(
          context,
          `Multiple distinct elements with the same placeholder name (\`${name}\`). ` +
            (placeholderAttribute
              ? `Differentiate them by adding/modifying the \`${placeholderAttribute}\` attribute ${eg}.`
              : `Differentiate them by setting \`macro.jsxPlaceholderAttribute\` in the lingui config and then adding the attribute to your elements ${eg}.`),
          el.loc,
        )
      }
    } else {
      elementsTracking.set(name, node)
    }
  }

  return {
    type: "element",
    name,
    value: node,
    children: tokenizeChildren(el.children, state, opts),
  }
}

function tokenizeChoiceElement(
  el: ElementNode,
  kind: JsxMacroName,
  state: MacroState,
  opts: ResolvedOptions,
): ArgToken {
  const { context } = state
  const format = kind.toLowerCase()

  const options: NonNullable<ArgToken["options"]> = {
    offset: undefined as unknown as string,
  }

  let token: ArgToken = {
    type: "arg",
    format,
    name: null as unknown as string,
    value: undefined as unknown as t.Expression,
    options,
  }

  const setOption = (name: string, value: (typeof options)[string]) => {
    if (pluralRuleRe.test(name)) {
      options[jsx2icuExactChoice(name)] = value
    } else {
      options[name] = value
    }
  }

  for (const prop of el.props) {
    if (isDirective(prop)) {
      if (prop.name !== "bind") continue

      const name = getStaticArg(prop)
      if (name === undefined || !choiceAttributeRe.test(name)) continue

      const exp = prop.exp
      if (!exp || exp.type !== NodeTypes.SIMPLE_EXPRESSION) continue

      const expression = parse(exp.content, context, prop.loc)
      if (!expression) continue

      if (name === "value") {
        token = { ...token, ...tokenizeExpression(expression, state.ctx) }
      } else if (format !== "select" && name === "offset") {
        if (t.isStringLiteral(expression) || t.isNumericLiteral(expression)) {
          options.offset = String(expression.value)
        } else {
          fail(context, `The \`offset\` attribute must be a number`, prop.loc)
        }
      } else if (t.isStringLiteral(expression)) {
        setOption(name, expression.value)
      } else if (t.isTemplateLiteral(expression)) {
        setOption(name, tokenizeTemplateLiteral(expression, state.ctx))
      } else {
        setOption(name, tokenizeExpressionNode(expression, state))
      }

      continue
    }

    const name = prop.name
    if (!choiceAttributeRe.test(name)) continue

    const value = prop.value?.content ?? ""

    if (name === "value") {
      token = {
        ...token,
        ...tokenizeExpression(t.stringLiteral(value), state.ctx),
      }
    } else if (format !== "select" && name === "offset") {
      options.offset = value
    } else {
      setOption(name, value)
    }
  }

  // Rich choice forms: <template #one>Hello <b>{{ name }}</b></template>
  for (const child of el.children) {
    if (!isElement(child)) continue

    const slotName = getSlotName(child)
    if (slotName === undefined) continue

    if (!choiceAttributeRe.test(slotName) || slotName === "value") {
      fail(
        context,
        `Unknown choice form \`${slotName}\` in <${el.tag}>`,
        child.loc,
      )
      continue
    }

    setOption(
      slotName,
      trimTokens(tokenizeChildren(child.children, state, opts)),
    )
  }

  if (token.value === undefined) {
    fail(context, `<${el.tag}> requires a \`value\` attribute`, el.loc)
  }

  return token
}

import * as compilerSfc from "@vue/compiler-sfc"
import {
  compileTemplate,
  parse,
  type CompilerError,
  type CompilerOptions,
  type SFCBlock,
} from "@vue/compiler-sfc"
import { extractor as babelExtractor } from "@lingui/cli/api"
import { type ExtractorCtx, type ExtractorType } from "@lingui/conf"
import { type LinguiTemplateTransformOptions } from "@lingui/vue/compiler"
import { compileScriptSetup, type ScriptTarget } from "./compile-script-setup"

export interface VueExtractorConfig {
  /**
   * Compile `<script setup>` blocks before extraction, so destructured props
   * (`__props.name` once compiled) produce the same message IDs as at runtime.
   *
   * Defaults to `true` when `macro.jsxRuntime` is `"vue"` (`@lingui/vue`
   * compiles the macros of `.vue` files after Vue compiled them), `false` otherwise.
   */
  reactivityTransform?: boolean
  /**
   * Extractor used for the script and template code compiled from `.vue` files.
   * Defaults to the Babel extractor from `@lingui/cli`.
   */
  extractor?: ExtractorType
  /**
   * Options of the `@lingui/vue` template transform which compiles
   * `<Trans>`, `<Plural>`, `<Select>`, `<SelectOrdinal>` and `` t`...` ``
   * in `<template>` blocks before extraction.
   *
   * Set to `false` to disable it (only `i18n._()` calls are extracted from templates).
   */
  template?: false | Omit<LinguiTemplateTransformOptions, "descriptorFields">
  /**
   * Options of the Vue template compiler (`whitespace`, `delimiters`...).
   */
  compilerOptions?: TemplateCompilerOptions
}

/**
 * `@vue/compiler-sfc` compiler options accepted by {@link VueExtractorConfig}.
 * `isTS` and `expressionPlugins` are derived from the `lang` of the script blocks.
 */
export type TemplateCompilerOptions = Omit<CompilerOptions, "isTS">

type OnMessageExtracted = Parameters<ExtractorType["extract"]>[2]

type ExtractTarget = ScriptTarget & { isTemplate?: boolean }

const templateScopeRe =
  /(?<![\w$.])(?:_ctx|\$setup|\$props|\$data|\$options)\./g

/**
 * The compiled template prefixes identifiers with their scope
 * (`_ctx.name`, `$setup.name`). Strip it from every identifier of the
 * expression (`_ctx.a + _ctx.b` -> `a + b`) so placeholders read as written.
 */
const normalizeTemplatePlaceholders =
  (onMessageExtracted: OnMessageExtracted): OnMessageExtracted =>
  (message) => {
    if (message.placeholders) {
      message.placeholders = Object.fromEntries(
        Object.entries(message.placeholders).map(([name, source]) => [
          name,
          source.replace(templateScopeRe, ""),
        ]),
      )
    }
    onMessageExtracted(message)
  }

const formatTemplateError = (
  filename: string,
  error: string | CompilerError,
): string => {
  if (typeof error === "string") return error

  const start = error.loc?.start
  const location = start ? `${filename}:${start.line}:${start.column} ` : ""

  return `${location}${error.message}`
}

type LinguiTemplateTransform =
  typeof import("@lingui/vue/compiler").linguiTemplateTransform

let templateTransformPromise:
  Promise<LinguiTemplateTransform | undefined> | undefined

export const isLinguiVueNotFound = (error: unknown) => {
  const { code, message } = (error ?? {}) as { code?: string; message?: string }

  return (
    (code === "ERR_MODULE_NOT_FOUND" || code === "MODULE_NOT_FOUND") &&
    /['"]@lingui\/vue(\/compiler)?['"]/.test(message ?? "")
  )
}

// Read through the namespace: older versions may not export `version`, and a
// named import of a missing export fails to link
const compilerSfcVersion = (compilerSfc as { version?: string }).version

/**
 * The template transform of `@lingui/vue` targets the template AST of Vue 3.4+.
 */
const supportsTemplateTransform = () => {
  const [major = 0, minor = 0] = (compilerSfcVersion ?? "0.0")
    .split(".")
    .map(Number)
  return major > 3 || (major === 3 && minor >= 4)
}

/**
 * Loads the template transform of `@lingui/vue`, or `undefined` when the
 * package is not installed. Loaded lazily: it pulls in `@vue/compiler-core`
 * and is only needed for `.vue` files with a `<template>` block.
 */
const loadTemplateTransform = () =>
  (templateTransformPromise ??= import("@lingui/vue/compiler").then(
    (module) => module.linguiTemplateTransform,
    (error: unknown) => {
      if (isLinguiVueNotFound(error)) return undefined
      throw error
    },
  ))

export const createVueExtractor = (
  config: VueExtractorConfig = {},
): ExtractorType => ({
  match(filename: string) {
    return filename.endsWith(".vue")
  },
  async extract(
    filename: string,
    code: string,
    onMessageExtracted,
    ctx: ExtractorCtx,
  ) {
    const { descriptor } = parse(code, {
      sourceMap: true,
      filename,
      ignoreEmpty: true,
    })

    const isTsBlock = (block: SFCBlock | null) =>
      block?.lang === "ts" || block?.lang === "tsx"
    const isTS =
      isTsBlock(descriptor.script) || isTsBlock(descriptor.scriptSetup)

    const macroConfig = ctx.linguiConfig?.macro

    const {
      reactivityTransform = macroConfig?.jsxRuntime === "vue",
      template = {},
      compilerOptions = {},
      extractor = babelExtractor,
    } = config

    const compiledScripts = compileScriptSetup(
      descriptor,
      filename,
      reactivityTransform,
    )

    const linguiTemplateTransform =
      template === false || !descriptor.template
        ? undefined
        : await loadTemplateTransform()

    // `@lingui/vue` is an optional peer dependency: without it, templates are
    // compiled as is, unless the config relies on the template macros.
    if (
      template !== false &&
      descriptor.template &&
      !linguiTemplateTransform &&
      (macroConfig?.jsxRuntime === "vue" || config.template !== undefined)
    ) {
      throw new Error(
        `[@lingui/extractor-vue] \`@lingui/vue\` is required to extract the template macros of ${filename}. ` +
          `Install it, or pass \`template: false\` to \`createVueExtractor()\`.`,
      )
    }

    if (linguiTemplateTransform && !supportsTemplateTransform()) {
      throw new Error(
        `[@lingui/extractor-vue] The template macros of \`@lingui/vue\` need \`@vue/compiler-sfc\` 3.4 or later, ` +
          `found ${compilerSfcVersion ?? "an older version"}. Update \`@vue/compiler-sfc\` in your lockfile, or pass \`template: false\` to \`createVueExtractor()\`.`,
      )
    }

    const nodeTransforms = linguiTemplateTransform
      ? [
          linguiTemplateTransform({
            placeholderAttribute: macroConfig?.jsxPlaceholderAttribute,
            placeholderDefaults: macroConfig?.jsxPlaceholderDefaults,
            idPrefixLeader: macroConfig?.idPrefixLeader,
            ...template,
            descriptorFields: "all",
          }),
        ]
      : []

    const compiledTemplate =
      descriptor.template &&
      compileTemplate({
        source: descriptor.template.content,
        filename,
        inMap: descriptor.template.map,
        id: filename,
        compilerOptions: {
          ...compilerOptions,
          isTS,
          expressionPlugins: [
            ...(isTS ? (["typescript"] as const) : []),
            ...(compilerOptions.expressionPlugins ?? []).filter(
              (plugin) => plugin !== "typescript",
            ),
          ],
          // The app's own transforms run first, as they would in the build.
          // `@lingui/vue` may resolve a different `@vue/compiler-core` version
          // than the `@vue/compiler-sfc` used here; the AST shapes are compatible.
          nodeTransforms: [
            ...(compilerOptions.nodeTransforms ?? []),
            ...(nodeTransforms as unknown as NonNullable<
              CompilerOptions["nodeTransforms"]
            >),
          ],
        },
      })

    const extractTarget = ({
      source,
      map,
      start,
      isTs,
      isTemplate,
    }: ExtractTarget) => {
      const onTargetMessageExtracted: typeof onMessageExtracted =
        map || !start
          ? onMessageExtracted
          : (msg) => {
              if (!msg.origin) {
                return onMessageExtracted(msg)
              }

              // without a source map the position is relative to the block
              const [, line, column] = msg.origin

              onMessageExtracted({
                ...msg,
                origin: [
                  filename,
                  line + start.line - 1,
                  line === 1 && column != null
                    ? column + start.column - 1
                    : column,
                ],
              })
            }

      return extractor.extract(
        filename + (isTs ? ".ts" : ""),
        source,
        isTemplate
          ? normalizeTemplatePlaceholders(onTargetMessageExtracted)
          : onTargetMessageExtracted,
        {
          sourceMaps: map,
          ...ctx,
        },
      )
    }

    // Extract the `<script>` blocks first so their messages are reported
    // even when the `<template>` block does not compile.
    await Promise.all(
      compiledScripts
        .filter((target) => target != null && target.source !== "")
        .map(extractTarget),
    )

    if (!compiledTemplate) return

    // Errors reported by the template transform (or by Vue itself) would
    // fail the build, so extraction must not silently succeed on them.
    if (compiledTemplate.errors.length) {
      throw new Error(
        `Cannot compile <template> block:\n` +
          compiledTemplate.errors
            .map((error) => `  ${formatTemplateError(filename, error)}`)
            .join("\n"),
      )
    }

    await extractTarget({
      source: compiledTemplate.code,
      map: compiledTemplate.map,
      isTs: isTS,
      isTemplate: true,
    })
  },
})

/**
 * @deprecated use {@link createVueExtractor} instead
 */
export const vueExtractor = createVueExtractor()

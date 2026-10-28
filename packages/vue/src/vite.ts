import type { Plugin, ResolvedConfig } from "vite"
import type { ParserPlugin } from "@babel/parser"
import { getConfig, type LinguiConfigNormalized } from "@lingui/conf"
import linguiMacroPlugin from "@lingui/babel-plugin-lingui-macro"
import {
  isLinguiTemplateTransform,
  linguiTemplateTransform,
  type DescriptorFieldsMode,
  type LinguiTemplateTransformOptions,
} from "./template/index"
import { escapeRegExp } from "./utils"

export type LinguiVueOptions = {
  cwd?: string
  configPath?: string
  skipValidation?: boolean

  /**
   * Controls which message descriptor fields are kept in the compiled code.
   * Defaults to `"id-only"` in production builds and `"all"` otherwise.
   */
  descriptorFields?: DescriptorFieldsMode

  /**
   * Options for the template transform, or `false` to disable it.
   * Disable it when you register `linguiTemplateTransform()` yourself in
   * `@vitejs/plugin-vue` options.
   */
  template?: false | Omit<LinguiTemplateTransformOptions, "descriptorFields">

  /**
   * Set to `false` to disable the Babel macro transform of `.vue`, `.js`,
   * `.ts`, `.jsx` and `.tsx` modules (e.g. when using
   * `@rolldown/plugin-babel` with `linguiTransformerBabelPreset()` instead).
   */
  macro?: boolean
}

// Module ids may end with a query. Most queries still load the file as
// JavaScript, but `otherFormQueryRe` matches the ones that load it as
// something else (`?raw`, `?url`, an SFC's styles...), which are skipped
const moduleRe = /\.(vue|[cm]?[jt]s)(\?.*)?$/
const jsxModuleRe = /\.[cm]?[jt]sx(\?.*)?$/
const nodeModulesRe = /[\\/]node_modules[\\/]/
const otherFormQueryRe =
  /[?&](raw|url|inline|worker|sharedworker)(&|=|$)|[?&]type=style(&|$)/
const extensionRe = /\.([cm]?[jt]sx?)$/

function getParserPlugins(id: string): ParserPlugin[] {
  // the extension ends the id (`App.vue?vue&type=script&lang.ts`), or comes
  // before the query (`module.ts?mock=automock`)
  const extension =
    (extensionRe.exec(id) ?? extensionRe.exec(id.replace(/\?.*$/, "")))?.[1] ??
    ""
  if (extension.endsWith("tsx")) return ["typescript", "jsx"]
  if (extension.endsWith("ts")) return ["typescript"]
  return ["jsx"]
}

/**
 * Vite integration for `@lingui/vue`:
 *
 * 1. registers `linguiTemplateTransform()` in `@vitejs/plugin-vue`, so Lingui
 *    macros work inside `<template>` blocks,
 * 2. runs `@lingui/babel-plugin-lingui-macro` on `.vue`, `.js`, `.ts`, `.jsx`
 *    and `.tsx` modules importing from `@lingui/core/macro` or
 *    `@lingui/vue/macro`.
 *
 * ```ts
 * import { defineConfig } from "vite"
 * import vue from "@vitejs/plugin-vue"
 * import { lingui } from "@lingui/vite-plugin"
 * import { linguiVue } from "@lingui/vue/vite"
 *
 * export default defineConfig({
 *   plugins: [vue(), linguiVue(), lingui()],
 * })
 * ```
 */
export function linguiVue(options: LinguiVueOptions = {}): Plugin[] {
  const { cwd, configPath, skipValidation } = options

  let config: LinguiConfigNormalized
  let macroRe: RegExp
  let descriptorFields: DescriptorFieldsMode

  const resolveConfig = (resolved: ResolvedConfig) => {
    if (config) return

    config = getConfig({ cwd, configPath, skipValidation })
    descriptorFields =
      options.descriptorFields ?? (resolved.isProduction ? "id-only" : "all")

    const macroIds = new Set([
      ...config.macro.corePackage,
      ...config.macro.jsxPackage,
    ])
    const macroPattern = Array.from(macroIds).map(escapeRegExp).join("|")
    macroRe = new RegExp(`from\\s*['"](?:${macroPattern})['"]`)
  }

  const templatePlugin: Plugin = {
    name: "lingui-vue:template",
    enforce: "pre",
    configResolved(resolved) {
      resolveConfig(resolved)

      if (options.template === false) return

      const vuePlugin = resolved.plugins.find((p) => p.name === "vite:vue")
      const vueOptions = (vuePlugin as { api?: { options?: VuePluginOptions } })
        ?.api?.options

      if (!vueOptions) {
        resolved.logger.warn(
          "[lingui] `@vitejs/plugin-vue` was not found, template macros are disabled. " +
            "Add `linguiTemplateTransform()` from `@lingui/vue/compiler` to `vue({ template: { compilerOptions: { nodeTransforms } } })` manually.",
        )
        return
      }

      const template = (vueOptions.template ??= {})
      const compilerOptions = (template.compilerOptions ??= {})
      const nodeTransforms = (compilerOptions.nodeTransforms ??= [])

      if (nodeTransforms.some(isLinguiTemplateTransform)) return

      nodeTransforms.push(
        linguiTemplateTransform({
          placeholderAttribute: config.macro.jsxPlaceholderAttribute,
          placeholderDefaults: config.macro.jsxPlaceholderDefaults,
          idPrefixLeader: config.macro.idPrefixLeader,
          ...options.template,
          descriptorFields,
        }),
      )
    },
  }

  const transformMacros = async (code: string, id: string) => {
    if (!macroRe.test(code)) {
      return
    }

    const babel = await import("@babel/core")

    const result = await babel.transformAsync(code, {
      filename: id,
      babelrc: false,
      configFile: false,
      sourceMaps: true,
      sourceFileName: id,
      parserOpts: {
        sourceType: "module",
        plugins: getParserPlugins(id),
      },
      plugins: [
        [linguiMacroPlugin, { linguiConfig: config, descriptorFields }],
      ],
    })

    if (!result?.code) {
      return
    }

    return {
      code: result.code,
      map: result.map ?? null,
    }
  }

  const createMacroPlugin = ({
    name,
    idRe,
    enforce,
  }: {
    name: string
    idRe: RegExp
    enforce?: Plugin["enforce"]
  }): Plugin => ({
    name,
    enforce,
    configResolved: resolveConfig,
    transform: {
      filter: {
        id: {
          include: [idRe],
          exclude: [nodeModulesRe, otherFormQueryRe],
        },
      },
      async handler(code, id) {
        // Additional check for backward compatibility, not needed for Rolldown powered Vite versions (8+)
        if (
          !idRe.test(id) ||
          nodeModulesRe.test(id) ||
          otherFormQueryRe.test(id)
        ) {
          return
        }

        return transformMacros(code, id)
      },
    },
  })

  // `.vue`, `.js` and `.ts` modules: `enforce: "post"` puts it after
  // `vite:vue`, which compiles SFCs to JavaScript, whatever the plugin order
  const macroPlugin = createMacroPlugin({
    name: "lingui-vue:macro",
    idRe: moduleRe,
    enforce: "post",
  })

  // `.jsx` and `.tsx` modules: runs before `@vitejs/plugin-vue-jsx` compiles
  // the JSX away, whatever the plugin order (Nuxt registers `vite:vue-jsx`
  // ahead of user plugins)
  const macroJsxPlugin = createMacroPlugin({
    name: "lingui-vue:macro-jsx",
    idRe: jsxModuleRe,
    enforce: "pre",
  })

  return options.macro === false
    ? [templatePlugin]
    : [templatePlugin, macroPlugin, macroJsxPlugin]
}

type VuePluginOptions = {
  template?: {
    compilerOptions?: {
      nodeTransforms?: unknown[]
    }
  }
}

export default linguiVue
export { linguiTemplateTransform }
export type { LinguiTemplateTransformOptions, DescriptorFieldsMode }

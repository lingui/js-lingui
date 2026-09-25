import type {
  LinguiMacroBabelPluginOptions,
  RolldownBabelPreset,
} from "./optionalTypes"
import { getConfig } from "@lingui/conf"
import { buildMacroFilterRe } from "./buildMacroFilterRe"

/**
 * Convenient helper to define a rolldown preset with Lingui Transformer for `@rolldown/plugin-babel`
 *
 * @example
 * ```js
 * // vite.config.js
 * import { defineConfig } from 'vite'
 * import react from '@vitejs/plugin-react'
 * import babel from '@rolldown/plugin-babel'
 * import { lingui, linguiTransformerBabelPreset } from '@lingui/vite-plugin'
 *
 * export default defineConfig({
 *   plugins: [react(), lingui(), babel({ presets: [linguiTransformerBabelPreset()] })],
 * })
 * ```
 * @param options Options Passed to the babel-plugin-lingui-macro
 * @param linguiConfigConfigOpts options passed to the lingui config discovery function
 *
 *
 * > [!TIP]
 * >
 * > `linguiTransformerBabelPreset` is only a convenient helper with a preconfigured filter. You can configure override the filters to fit your project structure or code. For example, if you know a large portion of your files are never Lingui-related, you can aggressively exclude them via `rolldown.filter`:
 * >
 * > ```js
 * > const myPreset = linguiTransformerBabelPreset()
 * > myPreset.rolldown.filter.id.exclude = ['src/legacy/**', 'src/utils/**']
 * >
 * > babel({
 * >   presets: [myPreset],
 * > })
 * > ```
 */
export const linguiTransformerBabelPreset = (
  options?: LinguiMacroBabelPluginOptions,
  linguiConfigConfigOpts: {
    cwd?: string
    configPath?: string
    skipValidation?: boolean
  } = {},
): RolldownBabelPreset => {
  if (!process.env.LINGUI_SUPPRESS_BABEL_WARNING) {
    console.warn(
      `[@lingui/vite-plugin] Babel-based macro transformation is deprecated and will be removed in a future version.\n` +
        `Use the native transformer instead: lingui({ macroTransform: true })\n` +
        `If you are using \`@rolldown/plugin-babel\` only for Lingui, you can remove it entirely.\n` +
        `Set LINGUI_SUPPRESS_BABEL_WARNING=1 to suppress this warning.`,
    )
  }

  const config = getConfig(linguiConfigConfigOpts)
  const hasMacroRe = buildMacroFilterRe(config)

  return {
    preset: {
      plugins: [["@lingui/babel-plugin-lingui-macro", options]],
    },
    rolldown: {
      filter: {
        code: hasMacroRe,
      },
    },
  }
}

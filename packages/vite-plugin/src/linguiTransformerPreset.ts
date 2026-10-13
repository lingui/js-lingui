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
      `[@lingui/vite-plugin] The Lingui Vite plugin now has a built-in macro transform, so you no longer need Babel for Lingui macros.\n` +
        `Turn it on with lingui({ macroTransform: true }). It will be on by default in the next major version.\n` +
        `If you only use \`@rolldown/plugin-babel\` for Lingui, you can remove it.\n` +
        `Set LINGUI_SUPPRESS_BABEL_WARNING=1 to hide this message.`,
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

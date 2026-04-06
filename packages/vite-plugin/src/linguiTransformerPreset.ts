import type {
  LinguiMacroBabelPluginOptions,
  RolldownBabelPreset,
} from "./optionalTypes"
import { getConfig } from "@lingui/conf"

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
  const config = getConfig(linguiConfigConfigOpts)

  const macroIds = new Set([
    ...config.macro.corePackage,
    ...config.macro.jsxPackage,
  ])

  // 1. Escape any special regex characters in the IDs (just in case)
  // 2. Join them with the '|' (OR) operator
  const macroPattern = Array.from(macroIds)
    .map((id) => id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")

  return {
    preset: {
      plugins: [["@lingui/babel-plugin-lingui-macro", options]],
    },
    rolldown: {
      filter: {
        code: new RegExp(`from ['"](?:${macroPattern})['"]`),
      },
    },
  }
}

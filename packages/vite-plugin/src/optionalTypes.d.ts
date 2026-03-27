/* eslint-disable @typescript-eslint/ban-ts-comment */

// @ts-ignore --- `@rolldown/plugin-babel` is an optional peer dependency, so this may cause an error
import type * as pluginBabel from "@rolldown/plugin-babel"
// @ts-ignore --- `babel-plugin-react-compiler` is an optional peer dependency, so this may cause an error
import type * as babelPluginLinguiMacro from "@lingui/babel-plugin-lingui-macro"

// @ts-ignore --- `@rolldown/plugin-babel` is an optional peer dependency, so this may cause an error
export type RolldownBabelPreset = pluginBabel.RolldownBabelPreset
// @ts-ignore --- `babel-plugin-react-compiler` is an optional peer dependency, so this may cause an error
export type LinguiMacroBabelPluginOptions =
  babelPluginLinguiMacro.LinguiPluginOpts

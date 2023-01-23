import { DEFAULT_EXTENSIONS, transformFileSync } from "@babel/core"

import type { ExtractPluginOpts } from "@lingui/babel-plugin-extract-messages"
import linguiExtractMessages from "@lingui/babel-plugin-extract-messages"

import { BabelOptions, ExtractorType } from "."
import { projectType } from "../detect"

const babelRe = new RegExp(
  "\\.(" +
    [...DEFAULT_EXTENSIONS, ".ts", ".tsx"]
      .map((ext) => ext.slice(1))
      .join("|") +
    ")$",
  "i"
)

const extractor: ExtractorType = {
  match(filename) {
    return babelRe.test(filename)
  },

  extract(filename, onMessageExtracted, options = {}) {
    const { babelOptions: _babelOptions = {} } = options
    const { plugins = [], ...babelOptions } = _babelOptions
    const frameworkOptions: BabelOptions = {}

    if (options.projectType === projectType.CRA) {
      frameworkOptions.presets = ["react-app"]
    }

    const pluginOpts: ExtractPluginOpts = {
      onMessageExtracted,
    }

    transformFileSync(filename, {
      ...babelOptions,
      ...frameworkOptions,
      // we override envName to avoid issues with NODE_ENV=production
      // https://github.com/lingui/js-lingui/issues/952
      envName: "development",
      plugins: ["macros", [linguiExtractMessages, pluginOpts], ...plugins],
    })
  },
}

export default extractor

import { transformFileSync, DEFAULT_EXTENSIONS } from "@babel/core"

import linguiExtractMessages from "@lingui/babel-plugin-extract-messages"

import { BabelOptions, ExtractorType } from "./types"
import { projectType } from "../detect"

const babelRe = new RegExp(
	"\\.(" + DEFAULT_EXTENSIONS.map(ext => ext.slice(1)).join("|") + ")$",
	"i"
)

const extractor: ExtractorType = {
  match(filename) {
    return babelRe.test(filename)
  },

  extract(filename, localeDir, options = {}) {
    const { babelOptions: _babelOptions = {} } = options
    const { plugins = [], ...babelOptions } = _babelOptions
    const frameworkOptions: BabelOptions = {}

    if (options.projectType === projectType.CRA) {
      frameworkOptions.presets = ["react-app"]
    }

    transformFileSync(filename, {
      ...babelOptions,
      ...frameworkOptions,
      plugins: ["macros", [linguiExtractMessages, { localeDir }], ...plugins],
    })
  },
}

export default extractor

// @flow
import { transformFileSync } from "babel-core"

import linguiTransformJs from "@lingui/babel-plugin-transform-js"
import linguiTransformReact from "@lingui/babel-plugin-transform-react"
import linguiExtractMessages from "@lingui/babel-plugin-extract-messages"

import type { ExtractorType } from "./types"
import { projectType } from "../detect"

const babelRe = /\.jsx?$/i

const extractor: ExtractorType = {
  match(filename) {
    return babelRe.test(filename)
  },

  extract(filename, localeDir, options = {}) {
    const { babelOptions = {} } = options
    const plugins = babelOptions.plugins || []
    const frameworkOptions = {}

    if (options.projectType === projectType.CRA) {
      frameworkOptions.presets = ["react-app"]
    }

    transformFileSync(filename, {
      ...babelOptions,
      ...frameworkOptions,
      plugins: [
        // Plugins run before presets, so we need to import transform-plugins
        // here until we have a better way to run extract-messages plugin
        // *after* all plugins/presets.
        // Transform plugins are idempotent, so they can run twice.
        linguiTransformJs,
        linguiTransformReact,
        [linguiExtractMessages, { localeDir }],
        ...plugins
      ]
    })
  }
}

export default extractor

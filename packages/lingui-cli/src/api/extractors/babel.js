import { transformFileSync } from 'babel-core'

import linguiTransformJs from 'babel-plugin-lingui-transform-js'
import linguiTransformReact from 'babel-plugin-lingui-transform-react'
import linguiExtractMessages from 'babel-plugin-lingui-extract-messages'

const babelRe = /\.jsx?$/i

export default {
  match (filename) {
    return babelRe.test(filename)
  },

  extract (filename, localeDir) {
    return transformFileSync(filename, {
      plugins: [
        // Plugins run before presets, so we need to import trasnform-plugins
        // here until we have a better way to run extract-messages plugin
        // *after* all plugins/presets.
        // Transform plugins are idempotent, so they can run twice.
        linguiTransformJs,
        linguiTransformReact,
        [linguiExtractMessages, { localeDir }]
      ]
    })
  }
}

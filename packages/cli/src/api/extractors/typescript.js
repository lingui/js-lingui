// @flow
import fs from "fs"
import { transform } from "babel-core"

import linguiTransformJs from "@lingui/babel-plugin-transform-js"
import linguiTransformReact from "@lingui/babel-plugin-transform-react"
import linguiExtractMessages from "@lingui/babel-plugin-extract-messages"
import * as ts from "typescript"

import type { ExtractorType } from "./types"

const babelRe = /(^.?|\.[^d]|[^.]d|[^.][^d])\.tsx?$/i

const extractor: ExtractorType = {
  match(filename) {
    return babelRe.test(filename)
  },

  extract(filename, localeDir, options = {}) {
    const plugins = options.plugins || []
    const content = fs.readFileSync(filename, "utf8")
    const isTsx = filename.endsWith(".tsx")
    // pass jsx to babel untouched
    const jsx = isTsx ? ts.JsxEmit.Preserve : ts.JsxEmit.None
    const stripped = ts.transpileModule(content, {
      compilerOptions: {
        filename: filename,
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2016, // use ES2015 or ES2016 to preserve tagged template literal
        allowSyntheticDefaultImports: true,
        jsx: jsx,
        moduleResolution: ts.ModuleResolutionKind.NodeJs
      }
    })

    const plugins = [
      // Plugins run before presets, so we need to import transform-plugins
      // here until we have a better way to run extract-messages plugin
      // *after* all plugins/presets.
      // Transform plugins are idempotent, so they can run twice.
      linguiTransformJs,
      linguiTransformReact,
      [linguiExtractMessages, { localeDir }],
      ...plugins
    ]

    if (isTsx) {
      plugins.unshift("syntax-jsx")
    }

    transform(stripped.outputText, {
      ...options,
      filename,
      plugins
    })
  }
}

export default extractor

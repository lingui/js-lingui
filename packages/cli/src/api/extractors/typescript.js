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

  extract(filename, localeDir) {
    const content = fs.readFileSync(filename, "utf8")
    const stripped = ts.transpileModule(content, {
      compilerOptions: {
        filename: filename,
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2016, // use ES2015 or ES2016 to preserve tagged template literal
        allowSyntheticDefaultImports: true,
        jsx: ts.JsxEmit.Preserve, // pass jsx to babel untouched
        moduleResolution: ts.ModuleResolutionKind.NodeJs
      }
    })

    transform(stripped.outputText, {
      filename,
      plugins: [
        // Plugins run before presets, so we need to import transform-plugins
        // here until we have a better way to run extract-messages plugin
        // *after* all plugins/presets.
        // Transform plugins are idempotent, so they can run twice.
        "syntax-jsx",
        linguiTransformJs,
        linguiTransformReact,
        [linguiExtractMessages, { localeDir }]
      ]
    })
  }
}

export default extractor

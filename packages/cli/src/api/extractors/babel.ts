import { DEFAULT_EXTENSIONS, transformAsync } from "@babel/core"

import type { ExtractPluginOpts } from "@lingui/babel-plugin-extract-messages"
import linguiExtractMessages from "@lingui/babel-plugin-extract-messages"

import { ExtractorType } from "."
import { ParserPlugin } from "@babel/parser"

const babelRe = new RegExp(
  "\\.(" +
    [...DEFAULT_EXTENSIONS, ".ts", ".mts", ".cts", ".tsx"]
      .map((ext) => ext.slice(1))
      .join("|") +
    ")$",
  "i"
)

const extractor: ExtractorType = {
  match(filename) {
    return babelRe.test(filename)
  },

  async extract(filename, code, onMessageExtracted, options = {}) {
    const parserPlugins: ParserPlugin[] = [
      // https://babeljs.io/docs/en/babel-parser#latest-ecmascript-features
      [
        "decorators",
        {
          decoratorsBeforeExport:
            options?.parserOptions?.decoratorsBeforeExport || true,
        },
      ],
    ]

    if (
      [/\.ts$/, /\.mts$/, /\.cts$/, /\.tsx$/].some((r) => filename.match(r))
    ) {
      parserPlugins.push("typescript")
    } else if (options?.parserOptions?.flow) {
      parserPlugins.push("flow")
    }

    if ([/\.jsx$/, /\.tsx$/].some((r) => filename.match(r))) {
      parserPlugins.push("jsx")
    }

    const extractPluginOpts: ExtractPluginOpts = {
      onMessageExtracted,
    }

    await transformAsync(code, {
      // don't generate code
      code: false,

      babelrc: false,
      configFile: false,

      filename: filename,

      sourceMaps: options.sourceMaps,
      parserOpts: {
        plugins: parserPlugins,
      },

      plugins: [
        [
          "macros",
          {
            lingui: { extract: true },
          },
        ],
        [linguiExtractMessages, extractPluginOpts],
      ],
    })
  },
}

export default extractor

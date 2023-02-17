import { DEFAULT_EXTENSIONS, transformAsync } from "@babel/core"

import type { ExtractPluginOpts } from "@lingui/babel-plugin-extract-messages"
import linguiExtractMessages from "@lingui/babel-plugin-extract-messages"

import type { ExtractorType } from "@lingui/conf"
import { ParserPlugin } from "@babel/parser"
import { LinguiMacroOpts } from "@lingui/macro/src"

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

  async extract(filename, code, onMessageExtracted, linguiConfig, options) {
    const parserOptions = linguiConfig.extractorParserOptions

    const parserPlugins: ParserPlugin[] = [
      // https://babeljs.io/docs/en/babel-parser#latest-ecmascript-features
      [
        "decorators",
        {
          decoratorsBeforeExport: parserOptions?.decoratorsBeforeExport || true,
        },
      ],
    ]

    if (
      [/\.ts$/, /\.mts$/, /\.cts$/, /\.tsx$/].some((r) => filename.match(r))
    ) {
      parserPlugins.push("typescript")
    } else if (parserOptions?.flow) {
      parserPlugins.push("flow")
    }

    if ([/\.jsx$/, /\.tsx$/].some((r) => filename.match(r))) {
      parserPlugins.push("jsx")
    }

    await transformAsync(code, {
      // don't generate code
      code: false,

      babelrc: false,
      configFile: false,

      filename: filename,

      sourceMaps: options?.sourceMaps,
      parserOpts: {
        plugins: parserPlugins,
      },

      plugins: [
        [
          "macros",
          {
            // macro plugin uses package `resolve` to find a path of macro file
            // this will not follow jest pathMapping and will resolve path from ./build
            // instead of ./src which makes testing & developing hard.
            // here we override resolve and provide correct path for testing
            resolvePath: (source: string) => require.resolve(source),
            lingui: {
              extract: true,
              linguiConfig,
            } satisfies LinguiMacroOpts,
          },
        ],
        [
          linguiExtractMessages,
          {
            onMessageExtracted,
          } satisfies ExtractPluginOpts,
        ],
      ],
    })
  },
}

export default extractor

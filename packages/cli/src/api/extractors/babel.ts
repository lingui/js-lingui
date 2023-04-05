import { DEFAULT_EXTENSIONS, transformAsync } from "@babel/core"

import type { ExtractPluginOpts } from "@lingui/babel-plugin-extract-messages"
import linguiExtractMessages from "@lingui/babel-plugin-extract-messages"

import type { ExtractorType } from "@lingui/conf"
import { ParserPlugin } from "@babel/parser"
import { SourceMapConsumer } from "source-map"
import { LinguiMacroOpts } from "@lingui/macro/node"

const babelRe = new RegExp(
  "\\.(" +
    [...DEFAULT_EXTENSIONS, ".ts", ".mts", ".cts", ".tsx"]
      .map((ext) => ext.slice(1))
      .join("|") +
    ")$",
  "i"
)

const inlineSourceMapsRE = new RegExp(
  /\/[\/\*][#@]\s+sourceMappingURL=data:application\/json;(?:charset:utf-8;)?base64,/i
)

const extractor: ExtractorType = {
  match(filename) {
    return babelRe.test(filename)
  },

  async extract(filename, code, onMessageExtracted, ctx) {
    const parserOptions = ctx.linguiConfig.extractorParserOptions

    // https://babeljs.io/docs/en/babel-parser#latest-ecmascript-features
    const parserPlugins: ParserPlugin[] = []

    if (
      [/\.ts$/, /\.mts$/, /\.cts$/, /\.tsx$/].some((r) => filename.match(r))
    ) {
      parserPlugins.push("typescript")
      if (parserOptions.tsExperimentalDecorators) {
        parserPlugins.push("decorators-legacy")
      } else {
        parserPlugins.push("decorators")
      }
    } else {
      parserPlugins.push("decorators")

      if (parserOptions?.flow) {
        parserPlugins.push("flow")
      }
    }

    if ([/\.jsx$/, /\.tsx$/].some((r) => filename.match(r))) {
      parserPlugins.push("jsx")
    }

    let sourceMapsConsumer: SourceMapConsumer

    if (ctx?.sourceMaps) {
      sourceMapsConsumer = await new SourceMapConsumer(ctx?.sourceMaps)
    } else if (code.search(inlineSourceMapsRE) != -1) {
      const { fromSource } = await import("convert-source-map")
      sourceMapsConsumer = await new SourceMapConsumer(
        fromSource(code).toObject()
      )
    }

    await transformAsync(code, {
      // don't generate code
      code: false,

      babelrc: false,
      configFile: false,

      filename: filename,

      inputSourceMap: ctx?.sourceMaps,
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
              linguiConfig: ctx.linguiConfig,
            } satisfies LinguiMacroOpts,
          },
        ],
        [
          linguiExtractMessages,
          {
            onMessageExtracted: (msg) => {
              if (!sourceMapsConsumer) {
                return onMessageExtracted(msg)
              }

              const [_, line, column] = msg.origin

              const mappedPosition = sourceMapsConsumer.originalPositionFor({
                line,
                column,
              })

              return onMessageExtracted({
                ...msg,
                origin: [
                  mappedPosition.source,
                  mappedPosition.line,
                  mappedPosition.column,
                ],
              })
            },
          } satisfies ExtractPluginOpts,
        ],
      ],
    })

    if (sourceMapsConsumer) {
      sourceMapsConsumer.destroy()
    }
  },
}

export default extractor

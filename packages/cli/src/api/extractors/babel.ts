import { DEFAULT_EXTENSIONS, transformAsync, ParserOptions } from "@babel/core"

import type {
  ExtractPluginOpts,
  Origin,
} from "@lingui/babel-plugin-extract-messages"
import linguiExtractMessages from "@lingui/babel-plugin-extract-messages"

import type { ExtractorType } from "@lingui/conf"
import { ParserPlugin } from "@babel/parser"

import { LinguiMacroOpts } from "@lingui/macro/node"
import { ExtractedMessage, ExtractorCtx } from "@lingui/conf"

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

/**
 * Create a source mapper which could read original positions
 * from either inline sourcemaps or from external passed as `sourceMaps` argument.
 *
 * Warning! You have to call destroy method after you finish working with a mapper.
 *
 * @param code source code
 * @param sourceMaps Raw Sourcemaps object to mapping from. Check the https://github.com/mozilla/source-map#new-sourcemapconsumerrawsourcemap
 */
async function createSourceMapper(code: string, sourceMaps?: any) {
  let sourceMapsConsumer: import("source-map").SourceMapConsumer

  if (sourceMaps) {
    const { SourceMapConsumer } = await import("source-map")
    sourceMapsConsumer = await new SourceMapConsumer(sourceMaps)
  } else if (code.search(inlineSourceMapsRE) != -1) {
    const { SourceMapConsumer } = await import("source-map")
    const { fromSource } = await import("convert-source-map")
    sourceMapsConsumer = await new SourceMapConsumer(
      fromSource(code).toObject()
    )
  }

  return {
    destroy: () => {
      if (sourceMapsConsumer) {
        sourceMapsConsumer.destroy()
      }
    },

    originalPositionFor: (origin: Origin): Origin => {
      if (!sourceMapsConsumer) {
        return origin
      }

      const [_, line, column] = origin

      const mappedPosition = sourceMapsConsumer.originalPositionFor({
        line,
        column,
      })

      return [mappedPosition.source, mappedPosition.line, mappedPosition.column]
    },
  }
}

/**
 * @public
 *
 * Low level function used in default Lingui extractor.
 * This function setup source maps and lingui plugins needed for
 * extraction process but leaving `parserOptions` up to userland implementation.
 *
 *
 * @example
 * ```ts
 * const extractor: ExtractorType = {
 *   ...
 *   async extract(filename, code, onMessageExtracted, ctx) {
 *     return extractFromFileWithBabel(filename, code, onMessageExtracted, ctx, {
 *       // https://babeljs.io/docs/babel-parser#plugins
 *       plugins: [
 *         "decorators-legacy",
 *         "typescript",
 *         "jsx",
 *       ],
 *     })
 *   },
 * }
 * ```
 */
export async function extractFromFileWithBabel(
  filename: string,
  code: string,
  onMessageExtracted: (msg: ExtractedMessage) => void,
  ctx: ExtractorCtx,
  parserOpts: ParserOptions
) {
  const mapper = await createSourceMapper(code, ctx?.sourceMaps)

  await transformAsync(code, {
    // don't generate code
    code: false,

    babelrc: false,
    configFile: false,

    filename: filename,

    inputSourceMap: ctx?.sourceMaps,
    parserOpts,

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
            return onMessageExtracted({
              ...msg,
              origin: mapper.originalPositionFor(msg.origin),
            })
          },
        } satisfies ExtractPluginOpts,
      ],
    ],
  })

  mapper.destroy()
}

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

    if ([/\.js$/, /\.jsx$/, /\.tsx$/].some((r) => filename.match(r))) {
      parserPlugins.push("jsx")
    }

    return extractFromFileWithBabel(filename, code, onMessageExtracted, ctx, {
      plugins: parserPlugins,
    })
  },
}

export default extractor

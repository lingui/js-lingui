import { compileTemplate, parse, type SFCBlock } from "@vue/compiler-sfc"
import { extractor as babelExtractor } from "@lingui/cli/api"
import { type ExtractorCtx, type ExtractorType } from "@lingui/conf"
import { compileScriptSetup, type ScriptTarget } from "./compile-script-setup"

export interface VueExtractorConfig {
  reactivityTransform?: boolean
  /**
   * Extractor used for the script and template code compiled from `.vue` files.
   * Defaults to the Babel extractor from `@lingui/cli`.
   */
  extractor?: ExtractorType
}

const withInlineSourceMap = (source: string, map: unknown) =>
  `${source}\n//# sourceMappingURL=data:application/json;base64,${Buffer.from(
    JSON.stringify(map),
  ).toString("base64")}`

export const createVueExtractor = (
  config: VueExtractorConfig = {},
): ExtractorType => ({
  match(filename: string) {
    return filename.endsWith(".vue")
  },
  async extract(
    filename: string,
    code: string,
    onMessageExtracted,
    ctx: ExtractorCtx,
  ) {
    const { descriptor } = parse(code, {
      sourceMap: true,
      filename,
      ignoreEmpty: true,
    })

    const isTsBlock = (block: SFCBlock | null) => block?.lang === "ts"

    const { reactivityTransform = false, extractor = babelExtractor } = config

    const compiledScripts = compileScriptSetup(
      descriptor,
      filename,
      reactivityTransform,
    )

    const compiledTemplate =
      descriptor.template &&
      compileTemplate({
        source: descriptor.template.content,
        filename,
        inMap: descriptor.template.map,
        id: filename,
        compilerOptions: {
          isTS:
            isTsBlock(descriptor.script) || isTsBlock(descriptor.scriptSetup),
        },
      })

    const targets: ScriptTarget[] = [
      ...compiledScripts,
      {
        source: compiledTemplate?.code ?? "",
        map: compiledTemplate?.map,
        isTs: isTsBlock(descriptor.script) || isTsBlock(descriptor.scriptSetup),
      },
    ]

    await Promise.all(
      targets
        .filter(
          (target): target is ScriptTarget =>
            target != null && target.source !== "",
        )
        .map(({ source, map, start, isTs }) =>
          extractor.extract(
            filename + (isTs ? ".ts" : ""),
            // the map is also passed as `ctx.sourceMaps`, inlining it covers
            // extractors which only read inline source maps, like the SWC one
            map ? withInlineSourceMap(source, map) : source,
            map || !start
              ? onMessageExtracted
              : (msg) => {
                  if (!msg.origin) {
                    return onMessageExtracted(msg)
                  }

                  // without a source map the position is relative to the block
                  const [, line, column] = msg.origin

                  onMessageExtracted({
                    ...msg,
                    origin: [
                      filename,
                      line + start.line - 1,
                      line === 1 && column != null
                        ? column + start.column - 1
                        : column,
                    ],
                  })
                },
            {
              sourceMaps: map,
              ...ctx,
            },
          ),
        ),
    )
  },
})

/**
 * @deprecated use {@link createVueExtractor} instead
 */
export const vueExtractor = createVueExtractor()

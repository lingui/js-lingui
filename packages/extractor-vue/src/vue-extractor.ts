import { parse, compileTemplate, SFCBlock } from "@vue/compiler-sfc"
import babel from "@lingui/cli/api/extractors/babel"
import type { ExtractorCtx, ExtractorType } from "@lingui/conf"

export const vueExtractor: ExtractorType = {
  match(filename: string) {
    return filename.endsWith(".vue")
  },
  async extract(
    filename: string,
    code: string,
    onMessageExtracted,
    ctx: ExtractorCtx
  ) {
    const { descriptor } = parse(code, {
      sourceMap: true,
      filename,
      ignoreEmpty: true,
    })

    const compiledTemplate = compileTemplate({
      source: code,
      filename,
      id: filename,
    })

    const isTsBlock = (block: SFCBlock) => block?.attrs?.lang === "ts"

    const targets = [
      [
        descriptor.script?.content,
        descriptor.script?.map,
        isTsBlock(descriptor.script),
      ],
      [
        descriptor.scriptSetup?.content,
        descriptor.scriptSetup?.map,
        isTsBlock(descriptor.script),
      ],
      [
        compiledTemplate?.code,
        compiledTemplate?.map,
        isTsBlock(descriptor.script),
      ],
    ] as const

    await Promise.all(
      targets
        .filter(([source]) => Boolean(source))
        .map(([source, map, isTs]) =>
          babel.extract(
            filename + (isTs ? ".ts" : ""),
            source,
            onMessageExtracted,
            {
              sourceMaps: map,
              ...ctx,
            }
          )
        )
    )
  },
}

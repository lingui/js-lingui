import { parse, compileTemplate, SFCBlock } from "@vue/compiler-sfc"
import { extractor } from "@lingui/cli/api"
import type { ExtractorCtx, ExtractorType } from "@lingui/conf"

export const vueExtractor: ExtractorType = {
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

    const targets = [
      [
        descriptor.script?.content,
        descriptor.script?.map,
        isTsBlock(descriptor.script),
      ],
      [
        descriptor.scriptSetup?.content,
        descriptor.scriptSetup?.map,
        isTsBlock(descriptor.scriptSetup),
      ],
      [
        compiledTemplate?.code,
        compiledTemplate?.map,
        isTsBlock(descriptor.script) || isTsBlock(descriptor.scriptSetup),
      ],
    ] as const

    await Promise.all(
      targets
        .filter(([source]) => !!source)
        .map(([source, map, isTs]) =>
          extractor.extract(
            filename + (isTs ? ".ts" : ""),
            source!,
            onMessageExtracted,
            {
              sourceMaps: map,
              ...ctx,
            },
          ),
        ),
    )
  },
}

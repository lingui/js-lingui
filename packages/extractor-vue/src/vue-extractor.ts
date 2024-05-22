import { parse, compileTemplate, SFCBlock } from "@vue/compiler-sfc"
import { extractor } from "@lingui/cli/api"
import type { ExtractorCtx, ExtractorType } from "@lingui/conf"
import { isElementNode } from "@lingui/vue/src/common/predicates"

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

    const isTsBlock = (block: SFCBlock) => block?.lang === "ts"

    const compiledTemplate =
      descriptor.template &&
      compileTemplate({
        source: descriptor.template.content,
        filename,
        inMap: descriptor.template.map,
        id: filename,

        compilerOptions: {
          nodeTransforms: [
            // will be called for each ast "node"
            // we want to run our test on the 1st real node
            (node, context) => {
              // context.
              console.log(node, context)
            },
          ],

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
        .filter(([source]) => Boolean(source))
        .map(([source, map, isTs]) =>
          extractor.extract(
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

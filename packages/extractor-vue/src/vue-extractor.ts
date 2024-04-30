import { extractor } from "@lingui/cli/api"
import type { ExtractorCtx, ExtractorType } from "@lingui/conf"
import { SFCBlock, compileTemplate, parse } from "@vue/compiler-sfc"

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
    const { descriptor, errors: parsedErrors } = parse(code, {
      sourceMap: true,
      filename,
      ignoreEmpty: true,
    })

    if (parsedErrors.length) {
      parsedErrors.forEach(console.log)
      throw new Error("Vue parsing failed")
    }

    const isTsBlock = (block: SFCBlock) => block?.lang === "ts"

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

    if (compiledTemplate?.errors?.length) {
      compiledTemplate.errors.forEach(console.log)
      throw new Error("Vue template compilation failed")
    }

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

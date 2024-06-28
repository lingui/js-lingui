import { extractor as defaultExtractor } from "@lingui/cli/api"
import {
  compileTemplate,
  parse,
  type SFCBlock,
  type SFCTemplateCompileResults,
} from "@vue/compiler-sfc"
import { transformer } from "../compiler"

//

type RawSourceMap = SFCTemplateCompileResults["map"]

function isFirstIsString(
  arr: [string | undefined, RawSourceMap | undefined, boolean]
): arr is [string, RawSourceMap | undefined, boolean] {
  return typeof arr[0] === "string"
}

type ExtractorType = typeof defaultExtractor

export const vueExtractor: ExtractorType = {
  match(filename) {
    return filename.endsWith(".vue")
  },
  async extract(filename, code, onMessageExtracted, ctx) {
    const { descriptor } = parse(code, {
      sourceMap: true,
      filename,
      ignoreEmpty: true,
    })
    const isTsBlock = (block: SFCBlock | null | undefined) =>
      block?.lang === "ts"
    const compiledTemplate =
      descriptor.template &&
      compileTemplate({
        source: descriptor.template.content,
        filename,
        inMap: descriptor.template.map,
        id: filename,
        compilerOptions: {
          comments: true,
          isTS:
            isTsBlock(descriptor.script) || isTsBlock(descriptor.scriptSetup),
          nodeTransforms: [transformer],
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
    ] satisfies [string | undefined, RawSourceMap | undefined, boolean][]

    // early return to please TypeScript
    if (!ctx) return

    await Promise.all(
      targets
        .filter<[string, RawSourceMap | undefined, boolean]>(isFirstIsString)
        .map(([source, map, isTs]) =>
          defaultExtractor.extract(
            filename + (isTs ? ".ts" : ""),
            source,
            onMessageExtracted,
            {
              ...ctx,
              sourceMaps: map,
            }
          )
        )
    )
  },
}

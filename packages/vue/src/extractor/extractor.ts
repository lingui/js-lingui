import { extractor as defaultExtractor } from "@lingui/cli/api"
import {
  compileTemplate,
  parse,
  type SFCBlock,
  type SFCTemplateCompileResults,
} from "@vue/compiler-sfc"

import { createTransformer } from "./transformer"

//

type RawSourceMap = SFCTemplateCompileResults["map"]

function isFirstIsString(
  arr: [string | undefined, RawSourceMap | undefined, boolean]
): arr is [string, RawSourceMap | undefined, boolean] {
  return typeof arr[0] === "string"
}

//
// from official @lingui/vue-extractor
//

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
          isTS:
            isTsBlock(descriptor.script) || isTsBlock(descriptor.scriptSetup),
          // the magic starts here
          nodeTransforms: [
            createTransformer((extrated) =>
              onMessageExtracted({
                ...extrated,
                origin: [
                  filename,
                  // node line starts from <template> tag
                  // <template> line includes itself
                  // so we substract 1 to avoid double count
                  extrated.origin.line +
                    (descriptor.template?.loc.start.line ?? 1) -
                    1,
                  extrated.origin.column,
                ],
              })
            ),
          ],
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
    await Promise.all(
      targets
        .filter<[string, RawSourceMap | undefined, boolean]>(isFirstIsString)
        .map(([source, map, isTs]) =>
          defaultExtractor.extract(
            filename + (isTs ? ".ts" : ""),
            source,
            onMessageExtracted,
            {
              sourceMaps: map,
              // TODO: find why destruct ctx here mess with the type
              ...ctx,
            } as Parameters<ExtractorType["extract"]>[3]
          )
        )
    )
  },
}

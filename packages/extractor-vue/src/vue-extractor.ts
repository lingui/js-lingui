import { compileTemplate, parse, SFCBlock } from "@vue/compiler-sfc"
import { extractor } from "@lingui/cli/api"
import type { ExtractorCtx, ExtractorType } from "@lingui/conf"
import { compileScriptSetup, ScriptTarget } from "./compile-script-setup"

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

    const reactivityTransform =
      ctx.linguiConfig.experimental?.extractor?.vueReactivityTransform ?? false

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
        .map(({ source, map, isTs }) =>
          extractor.extract(
            filename + (isTs ? ".ts" : ""),
            source,
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

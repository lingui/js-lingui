import {
  parse,
  compileTemplate,
  compileScript,
  SFCBlock,
  SFCDescriptor,
} from "@vue/compiler-sfc"
import { extractor } from "@lingui/cli/api"
import type { ExtractorCtx, ExtractorType } from "@lingui/conf"

type ScriptTarget = {
  content?: string
  map?: unknown
  isTs: boolean
}

function compileScriptSetup(
  descriptor: SFCDescriptor,
  filename: string,
  reactivityTransform: boolean
): { script?: ScriptTarget; scriptSetup: ScriptTarget } {
  const isTsScript = descriptor.script?.lang === "ts"
  const isTsScriptSetup = descriptor.scriptSetup?.lang === "ts"

  if (!reactivityTransform || !descriptor.scriptSetup) {
    return {
      script: {
        content: descriptor.script?.content,
        map: descriptor.script?.map,
        isTs: isTsScript,
      },
      scriptSetup: {
        content: descriptor.scriptSetup?.content,
        map: descriptor.scriptSetup?.map,
        isTs: isTsScriptSetup,
      },
    }
  }

  try {
    const compiled = compileScript(descriptor, {
      id: filename,
      sourceMap: true,
      reactivityTransform,
    })

    return {
      scriptSetup: {
        content: compiled.content,
        map: compiled.map,
        isTs: isTsScriptSetup,
      },
    }
  } catch (e) {
    return {
      script: {
        content: descriptor.script?.content,
        map: descriptor.script?.map,
        isTs: isTsScript,
      },
      scriptSetup: {
        content: descriptor.scriptSetup.content,
        map: descriptor.scriptSetup.map,
        isTs: isTsScriptSetup,
      },
    }
  }
}

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

    const isTsBlock = (block: SFCBlock | null) => block?.lang === "ts"

    const reactivityTransform =
      ctx.linguiConfig.experimental?.extractor?.vueReactivityTransform ?? false

    const { script, scriptSetup } = compileScriptSetup(
      descriptor,
      filename,
      reactivityTransform
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

    const targets = [
      script,
      scriptSetup,
      {
        content: compiledTemplate?.code,
        map: compiledTemplate?.map,
        isTs: isTsBlock(descriptor.script) || isTsBlock(descriptor.scriptSetup),
      },
    ]

    await Promise.all(
      targets
        .filter(
          (target): target is ScriptTarget =>
            target != null &&
            typeof target.content === "string" &&
            target.content !== ""
        )
        .map(({ content, map, isTs }) =>
          extractor.extract(
            filename + (isTs ? ".ts" : ""),
            content ?? "",
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

import { compileScript, type SFCDescriptor } from "@vue/compiler-sfc"

export type ScriptTarget = {
  source: string
  map?: unknown
  isTs: boolean
}

export function compileScriptSetup(
  descriptor: SFCDescriptor,
  filename: string,
  reactivityTransform: boolean,
): ScriptTarget[] {
  const isTsScript = descriptor.script?.lang === "ts"
  const isTsScriptSetup = descriptor.scriptSetup?.lang === "ts"

  if (!reactivityTransform || !descriptor.scriptSetup) {
    return [
      {
        source: descriptor.script?.content ?? "",
        map: descriptor.script?.map,
        isTs: isTsScript,
      },
      {
        source: descriptor.scriptSetup?.content ?? "",
        map: descriptor.scriptSetup?.map,
        isTs: isTsScriptSetup,
      },
    ]
  }

  try {
    const compiled = compileScript(descriptor, {
      id: filename,
      sourceMap: true,
      reactivityTransform,
    })

    return [
      {
        source: compiled.content,
        map: compiled.map,
        isTs: isTsScriptSetup,
      },
    ]
  } catch (e) {
    return [
      {
        source: descriptor.script?.content ?? "",
        map: descriptor.script?.map,
        isTs: isTsScript,
      },
      {
        source: descriptor.scriptSetup.content,
        map: descriptor.scriptSetup.map,
        isTs: isTsScriptSetup,
      },
    ]
  }
}

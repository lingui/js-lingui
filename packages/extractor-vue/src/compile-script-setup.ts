import {
  compileScript,
  type SFCDescriptor,
  type SFCScriptCompileOptions,
} from "@vue/compiler-sfc"

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
    const options: SFCScriptCompileOptions = {
      id: filename,
      sourceMap: true,
      // Vue < 3.4 only: enables the Reactivity Transform. Removed from the
      // types in 3.4, where it is ignored.
      ...({ reactivityTransform } as Partial<SFCScriptCompileOptions>),
    }
    const compiled = compileScript(descriptor, options)

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

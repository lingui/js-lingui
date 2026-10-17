import {
  compileScript,
  type SFCBlock,
  type SFCDescriptor,
} from "@vue/compiler-sfc"

export type ScriptTarget = {
  source: string
  map?: unknown
  /**
   * Where `source` starts in the .vue file. Used to report message positions
   * when there is no source map, as Vue doesn't generate one for `<script setup>`
   */
  start?: SFCBlock["loc"]["start"]
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
        start: descriptor.script?.loc.start,
        isTs: isTsScript,
      },
      {
        source: descriptor.scriptSetup?.content ?? "",
        map: descriptor.scriptSetup?.map,
        start: descriptor.scriptSetup?.loc.start,
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
        start: descriptor.script?.loc.start,
        isTs: isTsScript,
      },
      {
        source: descriptor.scriptSetup.content,
        map: descriptor.scriptSetup.map,
        start: descriptor.scriptSetup.loc.start,
        isTs: isTsScriptSetup,
      },
    ]
  }
}

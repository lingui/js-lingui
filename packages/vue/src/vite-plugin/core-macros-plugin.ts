import { type Plugin, type TransformResult } from "vite"
import * as babel from "@babel/core"

const sourceRegex = /\.(:?[j|t]sx?|vue)$/u

// make babel macros works in vite
export function linguiCoreMacros(): Plugin {
  return {
    name: "vite-plugin-vue-lingui-babel-macro",
    async transform(
      source: string,
      filename: string
    ): Promise<string | undefined | TransformResult> {
      if (filename.includes("node_modules")) {
        return undefined
      }

      if (!sourceRegex.test(filename)) {
        return undefined
      }

      const result = await babel.transformAsync(source, {
        filename,
        plugins: ["@lingui/babel-plugin-lingui-macro"],
        babelrc: false,
        configFile: false,
        sourceMaps: true,
      })

      return {
        code: result?.code,
        map: result?.map,
      } as TransformResult
    },
  } as const
}

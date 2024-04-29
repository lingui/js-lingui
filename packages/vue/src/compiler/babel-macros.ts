// TODO: need to go full ESM to be able to use those types
// import { type Plugin, type TransformResult } from 'vite'
import * as babel from "@babel/core"

const sourceRegex = /\.(:?[j|t]sx?|vue)$/u

// make babel macros works in vite
export function babelMacros() {
  return {
    name: "vite-plugin-babel-macros",
    async transform(source: string, filename: string) {
      if (filename.includes("node_modules")) {
        return undefined
      }

      if (!sourceRegex.test(filename)) {
        return undefined
      }

      const result = await babel.transformAsync(source, {
        filename,
        plugins: ["macros"],
        babelrc: false,
        configFile: false,
        sourceMaps: true,
      })

      return result
    },
  } as const
}

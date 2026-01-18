import { defineBuildConfig } from "unbuild"

export default defineBuildConfig({
  rollup: {
    output: {
      banner: (chunk: any) => {
        if (chunk.name === "index") {
          return `'use client';`
        }
      },
    },
    esbuild: {
      jsx: "automatic",
    },
  },
})

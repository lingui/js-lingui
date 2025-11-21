import { defineBuildConfig } from "unbuild"

export default defineBuildConfig({
  entries: ["src/index.ts", "src/index-rsc.ts", "src/server.ts"],
  declaration: "node16",
  rollup: {
    output: {
      banner: (chunk: any) => {
        if (chunk.name === "index") {
          return `'use client';`
        }
      },
    },
  },
})

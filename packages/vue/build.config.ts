import { defineBuildConfig } from "unbuild"

export default defineBuildConfig({
  entries: ["src/index.ts", "src/config.ts", "src/compiler.ts", "src/vite.ts"],
  declaration: "node16",
  externals: ["vue", "@vue/compiler-core", "vite", "@babel/core"],
})

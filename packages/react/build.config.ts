import { defineBuildConfig } from "unbuild"

export default defineBuildConfig({
  rollup: {
    esbuild: {
      loaders: { ".tsx": "tsx" },
    },
  },
})

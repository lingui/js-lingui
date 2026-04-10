import { babel } from "@rollup/plugin-babel"
import { defineBuildConfig } from "unbuild"

export default defineBuildConfig({
  entries: ["src/index.ts", "src/config.ts"],
  declaration: "node16",
  rollup: {
    commonjs: false,
    esbuild: {
      jsx: "preserve",
    },
  },
  hooks: {
    "rollup:options": (_, options) => {
      options.plugins.push(
        babel({
          babelHelpers: "bundled",
          babelrc: false,
          configFile: false,
          extensions: [".js", ".jsx", ".ts", ".tsx"],
          include: ["src/**/*"],
          presets: [["babel-preset-solid", { generate: "dom" }]],
        }),
      )
    },
  },
})

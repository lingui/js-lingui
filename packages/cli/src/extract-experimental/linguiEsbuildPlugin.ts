import { transformAsync } from "@babel/core"
import fs from "fs"
import path from "path"
import { Plugin } from "esbuild"
import { babelRe, getBabelParserOptions } from "../api/extractors/babel.js"
import linguiMacroPlugin, {
  type LinguiPluginOpts,
} from "@lingui/babel-plugin-lingui-macro"
import { LinguiConfigNormalized } from "@lingui/conf"

export const pluginLinguiMacro = (options: {
  linguiConfig: LinguiConfigNormalized
}): Plugin => ({
  name: "linguiMacro",
  setup(build) {
    build.onLoad({ filter: babelRe, namespace: "" }, async (args) => {
      const filename = path.relative(process.cwd(), args.path)

      const contents = await fs.promises.readFile(args.path, "utf8")

      const hasMacroRe = /from ["']@lingui(\/.+)?\/macro["']/g

      if (!hasMacroRe.test(contents)) {
        // let esbuild process file as usual
        return undefined
      }

      const result = await transformAsync(contents, {
        babelrc: false,
        configFile: false,

        filename: filename,

        sourceMaps: "inline",
        parserOpts: {
          plugins: getBabelParserOptions(
            filename,
            options.linguiConfig.extractorParserOptions
          ),
        },

        plugins: [
          [
            linguiMacroPlugin,
            {
              extract: true,
              linguiConfig: options.linguiConfig,
            } satisfies LinguiPluginOpts,
          ],
        ],
      })

      return { contents: result.code, loader: "tsx" }
    })
  },
})

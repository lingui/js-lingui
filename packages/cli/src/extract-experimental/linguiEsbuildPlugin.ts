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
}): Plugin => {
  const configuredPackages = [
    ...new Set([
      "@lingui/macro",
      "@lingui/core/macro",
      "@lingui/react/macro",
      ...options.linguiConfig.macro.corePackage,
      ...options.linguiConfig.macro.jsxPackage,
    ]),
  ].map((str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  const hasMacroRe = new RegExp(
    `from\\s*(["'])(?:${configuredPackages.join("|")})\\1`,
  )

  return {
    name: "linguiMacro",
    setup(build) {
      build.onLoad({ filter: babelRe, namespace: "" }, async (args) => {
        const filename = path.relative(process.cwd(), args.path)

        const contents = await fs.promises.readFile(args.path, "utf8")

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
            plugins: getBabelParserOptions(filename, {}),
          },

          plugins: [
            [
              linguiMacroPlugin,
              {
                descriptorFields: "all",
                linguiConfig: options.linguiConfig,
              } satisfies LinguiPluginOpts,
            ],
          ],
        })

        return { contents: result!.code!, loader: "tsx" }
      })
    },
  }
}

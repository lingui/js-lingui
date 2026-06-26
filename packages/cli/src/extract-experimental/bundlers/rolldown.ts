import type { BuildOptions, OutputChunk, Plugin } from "rolldown"
import type {
  ExperimentalExtractorBundler,
  BundleResult,
  BundleChunk,
} from "@lingui/conf"
import path from "path"
import { buildIncludeDepsFilter } from "../buildIncludeDepsFilter.js"
import { DEFAULT_EXCLUDE_EXTENSIONS } from "../constants.js"
import { buildContentFilterRe } from "../buildContentFilter.js"
import linguiMacroPlugin, {
  LinguiPluginOpts,
} from "@lingui/babel-plugin-lingui-macro"
import { transformAsync } from "@babel/core"
import { getBabelParserOptions } from "../../api/extractors/babel.js"

export type RolldownBundlerOptions = {
  /**
   * List of package name patterns to include for extraction.
   *
   * For example, to include all packages from your monorepo:
   *
   * ["@mycompany"]
   *
   * By default, all imports that look like package imports are ignored.
   * This means imports that do not start with `/`, `./`, `../`, or `#`
   * (used for subpath imports). TypeScript path aliases are also ignored
   * because they look like package imports.
   *
   * Add here the packages you want to include.
   */
  includeDeps?: string[]

  /**
   * svg, jpg and other files which might be imported in application should be excluded from analysis.
   * By default, extractor provides a comprehensive list of extensions. If you feel like something
   * is missing in this list please fill an issue on GitHub
   *
   * NOTE: changing this param will override default list of extensions.
   */
  excludeExtensions?: string[]
  resolveRolldownOptions?: (options: BuildOptions) => BuildOptions
}

function createExtRegExp(extensions: string[]) {
  return new RegExp("\\.(?:" + extensions.join("|") + ")(?:\\?.*)?$")
}

export function createRolldownBundler(
  options?: RolldownBundlerOptions,
): ExperimentalExtractorBundler {
  return {
    async bundle(entryPoints, outDir, linguiConfig): Promise<BundleResult> {
      let rolldown: typeof import("rolldown")
      try {
        rolldown = await import("rolldown")
      } catch {
        throw new Error(
          `"rolldown" is required for createRolldownBundler but is not installed. ` +
            `Install it with: npm install rolldown`,
        )
      }

      const includeDeps = options?.includeDeps || []
      const excludeExtensions =
        options?.excludeExtensions || DEFAULT_EXCLUDE_EXTENSIONS

      const shouldInclude = buildIncludeDepsFilter(includeDeps)
      const extRegExp = createExtRegExp(excludeExtensions)

      const hasMacroRe = buildContentFilterRe(linguiConfig)

      const macroPlugin: Plugin = {
        name: "lingui:macro-transform",
        transform: {
          filter: {
            id: /\.(?:[jt]sx?|[cm][jt]s)(?:$|\?)/,
            code: hasMacroRe,
          },
          handler: async (code, filename, meta) => {
            const result = await transformAsync(code, {
              babelrc: false,
              configFile: false,

              filename,

              sourceMaps: true,
              parserOpts: {
                plugins: getBabelParserOptions(filename, {}),
              },

              plugins: [
                [
                  linguiMacroPlugin,
                  {
                    descriptorFields: "all",
                    linguiConfig,
                  } satisfies LinguiPluginOpts,
                ],
              ],
            })

            return { code: result?.code ?? undefined, map: result?.map }
          },
        },
      }

      let rolldownOptions: BuildOptions = {
        input: entryPoints,
        output: {
          dir: outDir,
          format: "esm",
          sourcemap: "inline",
          entryFileNames: "[name].jsx",
          sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
            const sourcemapDir = path.dirname(sourcemapPath)
            const absoluteSource = path.resolve(
              sourcemapDir,
              relativeSourcePath,
            )
            return path.relative(process.cwd(), absoluteSource)
          },
        },
        platform: "node",
        treeshake: true,
        transform: {
          jsx: "preserve",
        },

        external: (id, importer) => {
          if (extRegExp.test(id)) {
            return true
          }
          if (importer && !path.isAbsolute(id) && /^[^.#/]/.test(id)) {
            return !shouldInclude(id)
          }
          return false
        },
        plugins: [macroPlugin],
      }

      if (options?.resolveRolldownOptions) {
        rolldownOptions = options.resolveRolldownOptions(rolldownOptions)
      }

      const result = await rolldown.build(rolldownOptions)

      const outputChunks = result.output.filter(
        (item): item is OutputChunk => item.type === "chunk",
      )

      const outputFileNames = new Set(outputChunks.map((c) => c.fileName))

      const chunks: BundleChunk[] = outputChunks.map((chunk) => ({
        id: chunk.fileName,
        filePath: path.join(outDir, chunk.fileName),
        entryPoint:
          chunk.isEntry && chunk.facadeModuleId
            ? chunk.facadeModuleId.replace(/\\/g, "/")
            : undefined,
        imports: [...chunk.imports, ...chunk.dynamicImports].filter((imp) =>
          outputFileNames.has(imp),
        ),
      }))

      return { chunks }
    },
  }
}

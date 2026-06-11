import type { BuildOptions, OutputChunk } from "rolldown"
import type { ExperimentalExtractorBundler, BundleResult } from "@lingui/conf"
import path from "path"
import { buildIncludeDepsFilter } from "../buildIncludeDepsFilter.js"
import { DEFAULT_EXCLUDE_EXTENSIONS } from "../constants.js"
import { buildContentFilterRe } from "../buildContentFilter.js"
import type { LinguiPluginOpts } from "@lingui/babel-plugin-lingui-macro"

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

      let babelPlugin: typeof import("@rolldown/plugin-babel")
      try {
        babelPlugin = await import("@rolldown/plugin-babel")
      } catch {
        throw new Error(
          `"@rolldown/plugin-babel" is required for createRolldownBundler but is not installed. ` +
            `Install it with: npm install @rolldown/plugin-babel`,
        )
      }

      const includeDeps = options?.includeDeps || []
      const excludeExtensions =
        options?.excludeExtensions || DEFAULT_EXCLUDE_EXTENSIONS

      const shouldInclude = buildIncludeDepsFilter(includeDeps)
      const extRegExp = createExtRegExp(excludeExtensions)

      const hasMacroRe = buildContentFilterRe(linguiConfig)

      const linguiBabelPreset = babelPlugin.defineRolldownBabelPreset({
        preset: {
          plugins: [
            [
              "@lingui/babel-plugin-lingui-macro",
              {
                descriptorFields: "all",
                linguiConfig,
              } satisfies LinguiPluginOpts,
            ],
          ],
        },
        rolldown: {
          filter: {
            code: hasMacroRe,
          },
        },
      })

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
        plugins: [
          babelPlugin.default({
            presets: [linguiBabelPreset],
          }),
        ],
      }

      if (options?.resolveRolldownOptions) {
        rolldownOptions = options.resolveRolldownOptions(rolldownOptions)
      }

      const result = await rolldown.build(rolldownOptions)

      const outputFiles = result.output
        .filter(
          (item): item is OutputChunk =>
            item.type === "chunk" &&
            item.isEntry &&
            item.facadeModuleId != null,
        )
        .map((chunk) => ({
          filePath: `${outDir}/${chunk.fileName}`,
          entryPoint: path.relative(process.cwd(), chunk.facadeModuleId!),
        }))

      return { outputFiles }
    },
  }
}

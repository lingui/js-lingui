import type { BuildOptions } from "esbuild"
import type { ExperimentalBundler, BundleResult } from "@lingui/conf"
import { pluginLinguiMacro } from "../linguiEsbuildPlugin.js"
import { buildIncludeDepsFilter } from "../buildIncludeDepsFilter.js"
import { DEFAULT_EXCLUDE_EXTENSIONS } from "../constants.js"

export type EsbuildBundlerOptions = {
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
  resolveEsbuildOptions?: (options: BuildOptions) => BuildOptions
}

function createExtRegExp(extensions: string[]) {
  return new RegExp("\\.(?:" + extensions.join("|") + ")(?:\\?.*)?$")
}

export function createEsbuildBundler(
  options?: EsbuildBundlerOptions,
): ExperimentalBundler {
  return {
    async bundle(entryPoints, outDir, linguiConfig): Promise<BundleResult> {
      let esbuild: typeof import("esbuild")
      try {
        esbuild = await import("esbuild")
      } catch {
        throw new Error(
          `"esbuild" is required for createEsbuildBundler but is not installed. ` +
            `Install it with: npm install esbuild`,
        )
      }

      const includeDeps = options?.includeDeps || []
      const excludeExtensions =
        options?.excludeExtensions || DEFAULT_EXCLUDE_EXTENSIONS

      const shouldInclude = buildIncludeDepsFilter(includeDeps)

      let esbuildOptions = {
        entryPoints,
        outExtension: { ".js": ".jsx" },
        jsx: "preserve",
        bundle: true,
        platform: "node",
        target: ["esnext"],
        format: "esm",
        splitting: false,
        treeShaking: true,
        outdir: outDir,
        sourcemap: "inline",
        sourceRoot: outDir,
        sourcesContent: false,
        metafile: true,

        plugins: [
          pluginLinguiMacro({ linguiConfig }),
          {
            name: "externalize-deps",
            setup(build) {
              build.onResolve({ filter: /^[^.#/].*/ }, async (args) => {
                if (shouldInclude(args.path) || args.kind === "entry-point") {
                  return { external: false }
                }

                return { external: true }
              })
            },
          },
          {
            name: "externalize-files",
            setup(build) {
              build.onResolve(
                { filter: createExtRegExp(excludeExtensions) },
                () => ({
                  external: true,
                }),
              )
            },
          },
        ],
      } satisfies BuildOptions

      if (options?.resolveEsbuildOptions) {
        esbuildOptions = options.resolveEsbuildOptions(
          esbuildOptions,
        ) as typeof esbuildOptions
      }

      const bundleResult = await esbuild.build(esbuildOptions)
      const metafile = bundleResult.metafile!

      const outputFiles = Object.keys(metafile.outputs)
        .filter((outFile) => metafile.outputs[outFile]?.entryPoint !== null)
        .map((outFile) => ({
          filePath: outFile,
          entryPoint: metafile.outputs[outFile]?.entryPoint,
        }))

      return { outputFiles } as BundleResult
    },
  }
}

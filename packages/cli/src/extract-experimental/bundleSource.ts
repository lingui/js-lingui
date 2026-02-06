import {
  ExperimentalExtractorOptions,
  LinguiConfigNormalized,
} from "@lingui/conf"
import { BuildOptions, Metafile } from "esbuild"
import { pluginLinguiMacro } from "./linguiEsbuildPlugin.js"
import { buildIncludeDepsFilter } from "./buildIncludeDepsFilter.js"

function createExtRegExp(extensions: string[]) {
  return new RegExp("\\.(?:" + extensions.join("|") + ")(?:\\?.*)?$")
}

export async function bundleSource(
  linguiConfig: LinguiConfigNormalized,
  extractorConfig: ExperimentalExtractorOptions,
  entryPoints: string[],
  outDir: string,
  rootDir: string,
): Promise<Metafile> {
  const esbuild = await import("esbuild")

  const excludeExtensions = extractorConfig.excludeExtensions || [
    "ico",
    "pot",
    "xliff",
    "woff2",
    "woff",
    "eot",
    "gif",
    "otf",
    "ttf",
    "mp4",
    "svg",
    "png",
    "css",
    "sass",
    "scss",
    "less",
    "jpg",
  ]

  const esbuildOptions = {
    entryPoints: entryPoints,
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
          const shouldInclude = buildIncludeDepsFilter(
            extractorConfig.includeDeps || [],
          )

          // considers all import paths that "look like" package imports in the original source code to be package imports.
          // Specifically import paths that don't start with a path segment of / or . or .. are considered to be package imports.
          // The only two exceptions to this rule are subpath imports (which start with a # character) and deps specified in the `includeDeps`
          build.onResolve({ filter: /^[^.#/].*/ }, async (args) => {
            if (shouldInclude(args.path)) {
              return { external: false }
            }

            return {
              external: true,
            }
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

  const bundleResult = await esbuild.build(
    extractorConfig.resolveEsbuildOptions
      ? (extractorConfig.resolveEsbuildOptions(
          esbuildOptions,
        ) as typeof esbuildOptions)
      : esbuildOptions,
  )

  return bundleResult.metafile
}

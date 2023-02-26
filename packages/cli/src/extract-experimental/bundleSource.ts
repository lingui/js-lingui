import { ExperimentalExtractorOptions } from "@lingui/conf"
import { BuildOptions } from "esbuild"
import {
  buildExternalizeFilter,
  getPackageJson,
} from "./buildExternalizeFilter"

function createExtRegExp(extensions: string[]) {
  return new RegExp("\\.(?:" + extensions.join("|") + ")(?:\\?.*)?$")
}

export async function bundleSource(
  config: ExperimentalExtractorOptions,
  entryPoints: string[],
  outDir: string,
  rootDir: string
) {
  const esbuild = await import("esbuild")

  const excludeExtensions = config.excludeExtensions || [
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
    "less",
    "jpg",
  ]

  const packageJson = await getPackageJson(rootDir)

  const esbuildOptions: BuildOptions = {
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
    outbase: rootDir,
    metafile: true,
    plugins: [
      {
        name: "externalize-deps",
        setup(build) {
          const isExternal = buildExternalizeFilter({
            includeDeps: config.includeDeps || [],
            excludeDeps: config.excludeDeps || [],
            packageJson,
          })

          // externalize bare imports
          build.onResolve({ filter: /^[^.].*/ }, async ({ path: id }) => {
            if (isExternal(id)) {
              return {
                external: true,
              }
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
            })
          )
        },
      },
    ],
  }

  return await esbuild.build(
    config.resolveEsbuildOptions
      ? config.resolveEsbuildOptions(esbuildOptions)
      : esbuildOptions
  )
}

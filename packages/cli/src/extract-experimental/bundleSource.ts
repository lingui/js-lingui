import { LinguiConfigNormalized } from "@lingui/conf"
import { BuildOptions } from "esbuild"
import { pluginLinguiMacro } from "./linguiEsbuildPlugin"

function createExtRegExp(extensions: string[]) {
  return new RegExp("\\.(?:" + extensions.join("|") + ")(?:\\?.*)?$")
}

export async function bundleSource(
  linguiConfig: LinguiConfigNormalized,
  entryPoints: string[],
  outDir: string,
  rootDir: string
) {
  const esbuild = await import("esbuild")

  const config = linguiConfig.experimental.extractor
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
    "scss",
    "less",
    "jpg",
  ]

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
    packages: "external",
    outbase: rootDir,
    metafile: true,

    plugins: [
      pluginLinguiMacro({ linguiConfig }),
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

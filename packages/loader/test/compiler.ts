import path from "path"
import webpack from "webpack"
import { mkdtempSync } from "fs"
import os from "os"
import { LinguiLoaderOptions } from "../src/webpackLoader"

export type BuildResult = {
  loadBundle(): Promise<any>
  stats: webpack.StatsCompilation
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
export async function build(
  entryPoint: string,
  loaderOptions: LinguiLoaderOptions = {},
): Promise<BuildResult> {
  // set cwd() to working path
  const oldCwd = process.cwd()

  process.chdir(path.dirname(entryPoint))

  const compiler = getCompiler(entryPoint, loaderOptions)

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      process.chdir(oldCwd)

      if (err) {
        return reject(err)
      }

      const jsonStats = stats!.toJson()
      compiler.close(() => {
        resolve({
          loadBundle: () =>
            import(path.join(jsonStats.outputPath!, "bundle.js")),
          stats: jsonStats,
        })
      })
    })
  })
}

export function watch(
  entryPoint: string,
  loaderOptions: LinguiLoaderOptions = {},
) {
  const compiler = getCompiler(entryPoint, loaderOptions)

  let deferred = createDeferred<webpack.StatsCompilation>()

  const watching = compiler.watch({}, async (err, stats) => {
    err ? deferred.reject(err) : deferred.resolve(stats!.toJson())
    deferred = createDeferred<any>()
  })

  let readCount = 0
  return {
    build: async (): Promise<BuildResult> => {
      const stats = await deferred.promise

      return {
        loadBundle: async () => {
          // avoid race condition between writing on the disk and reading
          await delay(100)

          // add query param to invalidate import cache
          return import(
            path.join(stats.outputPath!, "bundle.js?read=" + readCount++)
          )
        },
        stats,
      }
    },
    stop: () => new Promise((resolve) => watching.close(resolve)),
  }
}

export function getCompiler(
  entryPoint: string,
  loaderOptions: LinguiLoaderOptions,
) {
  return webpack({
    mode: "development",
    target: "node",
    entry: entryPoint,
    resolveLoader: {
      alias: {
        "@lingui/loader": path.resolve(__dirname, "./loader.cjs"),
      },
    },
    module: {
      rules: [
        {
          test: /\.po$/,
          use: {
            loader: "@lingui/loader",
            options: loaderOptions,
          },
        },
      ],
    },
    output: {
      chunkFormat: false,
      path: mkdtempSync(path.join(os.tmpdir(), `lingui-test-${process.pid}`)),
      filename: "bundle.js",
      libraryTarget: "commonjs",
    },
  })
}

function createDeferred<T>() {
  let deferred: {
    resolve: (r: T) => void
    reject: (err: any) => void
  }

  const promise = new Promise<T>((resolve, reject) => {
    deferred = { resolve, reject }
  })

  return { ...deferred!, promise }
}

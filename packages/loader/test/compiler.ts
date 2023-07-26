import path from "path"
import webpack from "webpack"
import { mkdtempSync } from "fs"
import os from "os"

export type BuildResult = {
  loadBundle(): Promise<any>
  stats: webpack.StatsCompilation
}

export async function build(entryPoint: string): Promise<BuildResult> {
  // set cwd() to working path
  process.chdir(path.dirname(entryPoint))

  const compiler = getCompiler(entryPoint)

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err)
      const jsonStats = stats.toJson()
      compiler.close(() => {
        resolve({
          loadBundle: () =>
            import(path.join(jsonStats.outputPath, "bundle.js")),
          stats: jsonStats,
        })
      })
    })
  })
}

export function watch(entryPoint: string) {
  const compiler = getCompiler(entryPoint)

  let deferred = createDeferred<webpack.StatsCompilation>()

  const watching = compiler.watch({}, async (err, stats) => {
    err ? deferred.reject(err) : deferred.resolve(stats.toJson())
    deferred = createDeferred<any>()
  })

  return {
    build: async (): Promise<BuildResult> => {
      const stats = await deferred.promise

      return {
        loadBundle: () => import(path.join(stats.outputPath, "bundle.js")),
        stats,
      }
    },
    stop: () => new Promise((resolve) => watching.close(resolve)),
  }
}

export function getCompiler(entryPoint: string) {
  return webpack({
    mode: "development",
    target: "node",
    entry: entryPoint,
    resolveLoader: {
      alias: {
        "@lingui/loader": path.resolve(__dirname, "../src/webpackLoader.ts"),
      },
    },
    output: {
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
    promise: Promise<T>
  }

  const promise = new Promise<T>((resolve, reject) => {
    deferred = { resolve, reject, promise: undefined }
  })

  return { ...deferred, promise }
}

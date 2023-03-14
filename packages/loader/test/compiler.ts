import path from "path"
import webpack from "webpack"
import { mkdtempSync } from "fs"
import os from "os"

export default async (
  entryPoint: string,
  options?: any
): Promise<webpack.StatsCompilation> => {
  const compiler = webpack({
    mode: "development",
    target: "node",
    entry: entryPoint,
    output: {
      path: mkdtempSync(path.join(os.tmpdir(), `lingui-test-${process.pid}`)),
      filename: "bundle.js",
      libraryTarget: "commonjs",
    },
    module: {
      rules: [
        {
          test: /\.po$/,
          use: {
            loader: path.resolve(__dirname, "../src/webpackLoader.ts"),
            options,
          },
        },
      ],
    },
  })

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err)
      if (stats.hasErrors()) reject(stats.toJson().errors)

      resolve(stats.toJson())
    })
  })
}

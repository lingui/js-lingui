import path from "path"
import webpack from "webpack"
import MemoryFS from "memory-fs"

export default (fixture, options) => {
  const compiler = webpack({
    mode: "development",
    context: __dirname,
    entry: "." + path.sep + fixture,
    output: {
      path: __dirname,
      filename: "bundle.js"
    },
    module: {
      rules: [
        {
          test: /\.po$/,
          use: {
            loader: path.resolve(__dirname, "../src/index.js"),
            options
          }
        }
      ]
    }
  })

  compiler.outputFileSystem = new MemoryFS()

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err)

      resolve(stats)
    })
  })
}

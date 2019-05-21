import path from "path"
import webpack from "webpack"
import MemoryFS from "memory-fs"

export default (fixture, options = {}) => {
  const compiler = webpack({
    context: __dirname,
    entry: "." + path.sep + fixture,
    output: {
      path: __dirname,
      filename: "bundle.js"
    },
    module: {
      rules: [
        {
          test: /\.json$/,
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

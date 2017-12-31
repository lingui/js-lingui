import path from "path"
import webpack from "webpack"
import MemoryFS from "memory-fs"

export default (fixture, options = {}) => {
  const cwd = process.cwd()
  process.chdir(__dirname)

  const catalogPath = path.relative("", fixture)
  const compiler = webpack({
    context: __dirname,
    entry: fixture,
    output: {
      path: __dirname,
      filename: "bundle.js"
    },
    module: {
      rules: [
        {
          test: /\.json$/,
          use: {
            loader: path.resolve(__dirname, "../src/index.js")
          }
        }
      ]
    }
  })

  compiler.outputFileSystem = new MemoryFS()

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      process.chdir(cwd)
      if (err) reject(err)

      resolve(stats)
    })
  })
}

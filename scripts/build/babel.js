const fs = require("fs")
const path = require("path")
const chalk = require("chalk")
const babel = require("babel-core")
const ora = require("ora")
const glob = require("glob")

const babelConfig = require("./babel.config")
const Packaging = require("./packaging")
const { asyncMkDirP } = require("./utils")

const ignorePatterns = [/\.test.js$/, /fixtures/]

module.exports = async function(bundle) {
  const logKey = chalk.white.bold(bundle.entry)

  const spinner = ora(logKey).start()

  try {
    const resolvedEntry = require.resolve(bundle.entry)
    const packageDir = path.dirname(resolvedEntry)
    const srcDir = path.join(packageDir, "src")

    const files = glob
      .sync(srcDir + "**/*.js", {
        ignore: ["*.test.js", "**/fixtures/"]
      })
      .map(filename => path.relative(srcDir, filename))

    for (const filename of files) {
      const [mainOutputPath] = Packaging.getBundleOutputPaths(
        "NODE",
        filename,
        bundle.entry
      )

      const outputDir = path.dirname(mainOutputPath)
      await asyncMkDirP(outputDir)

      const { code } = babel.transformFileSync(
        path.join(srcDir, filename),
        babelConfig({ modules: true })
      )
      fs.writeFileSync(mainOutputPath, code)
    }
  } catch (error) {
    spinner.fail()
    throw error
  }

  spinner.succeed()
}

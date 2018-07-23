const fs = require("fs")
const path = require("path")
const chalk = require("chalk")
const babel = require("babel-core")
const ora = require("ora")

const babelConfig = require("./babel.config")
const Packaging = require("./packaging")
const { asyncMkDirP } = require("./utils")

const ignorePatterns = [/\.test.js$/]

function walk(base, relativePath = "") {
  let files = []

  fs.readdirSync(path.join(base, relativePath)).forEach(dirname => {
    const directory = path.join(relativePath, dirname)
    if (fs.lstatSync(path.join(base, directory)).isDirectory()) {
      files = files.concat(walk(base, directory))
    } else if (
      !/\.js$/.test(directory) ||
      ignorePatterns.some(pattern => pattern.test(directory))
    ) {
      return
    } else {
      files.push(directory)
    }
  })

  return files
}

module.exports = async function(bundle) {
  const logKey = chalk.white.bold(bundle.entry)

  const spinner = ora(logKey).start()

  try {
    const resolvedEntry = require.resolve(bundle.entry)
    const packageDir = path.dirname(resolvedEntry)
    const srcDir = path.join(packageDir, "src")

    const files = walk(srcDir)

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

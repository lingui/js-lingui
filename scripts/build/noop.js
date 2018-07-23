const fs = require("fs")
const path = require("path")
const chalk = require("chalk")
const babel = require("babel-core")
const ora = require("ora")

const Packaging = require("./packaging")
const { asyncCopyTo } = require("./utils")

module.exports = async function(bundle) {
  const logKey = chalk.white.bold(bundle.entry)

  const spinner = ora(logKey).start()

  try {
    const resolvedEntry = require.resolve(bundle.entry)
    const packageDir = path.dirname(resolvedEntry)

    const [mainOutputPath] = Packaging.getBundleOutputPaths(
      "NOOP",
      "index.js",
      bundle.entry
    )

    const outputDir = path.dirname(mainOutputPath)
    await asyncCopyTo(path.join(packageDir, "index.js"), mainOutputPath)
  } catch (error) {
    spinner.fail()
    throw error
  }
  spinner.succeed()
}

import {BundleDef, BundleType} from "./bundles"
import {getBundleOutputPaths} from "./packaging"
import {asyncCopyTo, getPackageDir} from "./utils"

const path = require("path")
const chalk = require("chalk")
const ora = require("ora")

export default async function(bundle: BundleDef) {
  const logKey = chalk.white.bold(bundle.packageName)

  const spinner = ora(logKey).start()

  try {
    const packageDir = getPackageDir(bundle.packageName)

    const [mainOutputPath] = getBundleOutputPaths(
      BundleType.NOOP,
      "index.js",
      bundle.packageName
    )

    await asyncCopyTo(path.join(packageDir, "index.js"), mainOutputPath)
  } catch (error) {
    spinner.fail()
    throw error
  }
  spinner.succeed()
}

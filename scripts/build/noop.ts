import {BundleDef} from "./bundles"
import {asyncCopyTo, getPackageDir} from "./utils"
import nodePath from "path";
import ora from "ora";
import chalk from "chalk";

export default async function(bundle: BundleDef) {
  const logKey = chalk.white.bold(bundle.packageName)

  const spinner = ora(logKey).start()

  try {
    const packageDir = getPackageDir(bundle.packageName)
    const outputPath = nodePath.join(packageDir, "build", "index.js")
    await asyncCopyTo(nodePath.join(packageDir, "index.js"), outputPath)
  } catch (error) {
    spinner.fail()
    throw error
  }
  spinner.succeed()
}

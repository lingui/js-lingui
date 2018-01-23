const fs = require("fs-extra")
const path = require("path")
const ora = require("ora")
const { execSync } = require("child_process")

const PACKAGES_DIR = "build/packages"

function releasePackage(packagePath) {
  const { version } = fs.readJsonSync(path.join(packagePath, "package.json"))
  const name = packagePath.split("/").reverse()[0]
  const spinner = ora(`Publishing @lingui/${name}@${version}`)

  try {
    execSync(`npm publish --access public --tag next`, {
      cwd: packagePath
    })
  } catch (e) {
    spinner.fail(`Version ${version} already published!`)
  }

  spinner.succeed()
}

fs
  .readdirSync(PACKAGES_DIR)
  .map(directory => path.join(PACKAGES_DIR, directory))
  .filter(directory => fs.lstatSync(directory).isDirectory())
  .forEach(releasePackage)

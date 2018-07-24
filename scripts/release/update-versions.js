const fs = require("fs-extra")
const path = require("path")
const chalk = require("chalk")
const semver = require("semver")
const { execSync } = require("child_process")
const { getVersion } = require("./version")

const argv = require("minimist")(process.argv.slice(2), {
  alias: { "dry-run": "dryRun" }
})

const PACKAGES_DIR = "build/packages"

async function updatePackage(version, packageName) {
  const packageJsonPath = path.join(packageName, "package.json")
  const packageJson = await fs.readJson(packageJsonPath)

  packageJson.version = version
  packageJson.dependencies = updatePackageDependencies(
    version,
    packageJson.dependencies
  )
  packageJson.devDependencies = updatePackageDependencies(
    version,
    packageJson.devDependencies
  )

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 })
}

function updatePackageDependencies(version, dependencies) {
  if (!dependencies) return

  const updatedDependencies = {}

  Object.keys(dependencies).forEach(dependency => {
    if (dependency.startsWith("@lingui/")) {
      updatedDependencies[dependency] = version
    } else {
      // ignore anything else
      updatedDependencies[dependency] = dependencies[dependency]
    }
  })

  return updatedDependencies
}

async function main() {
  const version = await getVersion(argv.next)

  await Promise.all(
    fs
      .readdirSync(PACKAGES_DIR)
      .map(directory => path.join(PACKAGES_DIR, directory))
      .filter(directory => fs.lstatSync(directory).isDirectory())
      .map(packageName => updatePackage(version, packageName))
  )
}

main()

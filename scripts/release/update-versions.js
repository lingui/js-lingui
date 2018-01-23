const fs = require("fs-extra")
const path = require("path")
const chalk = require("chalk")
const semver = require("semver")
const { execSync } = require("child_process")

const VERSION_FILE = "packages/version.txt"
const PACKAGES_DIR = "packages"

const version = fs
  .readFileSync(VERSION_FILE)
  .toString()
  .trim()

async function updatePackage(packageName) {
  const packageJsonPath = path.join(packageName, "package.json")
  const packageJson = await fs.readJson(packageJsonPath)

  packageJson.version = version
  packageJson.dependencies = updatePackageDependencies(packageJson.dependencies)
  packageJson.devDependencies = updatePackageDependencies(
    packageJson.devDependencies
  )

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 })
}

function updatePackageDependencies(dependencies) {
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
  await Promise.all(
    fs
      .readdirSync(PACKAGES_DIR)
      .map(directory => path.join(PACKAGES_DIR, directory))
      .filter(directory => fs.lstatSync(directory).isDirectory())
      .map(updatePackage)
  )

  execSync(`git add ${VERSION_FILE}`)
  execSync(`git add ${PACKAGES_DIR}/*/package.json`)
  execSync(`git commit -m 'chore: Release version ${version}'`)
  execSync(`git tag v${version}`)
}

main()

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

const BUILD_DIR = path.resolve("build/packages")
const EXAMPLES_DIR = path.resolve("examples")

function listDirs(dir) {
  return fs
    .readdirSync(dir)
    .filter(dirname => fs.lstatSync(path.join(dir, dirname)).isDirectory())
}

function linkDependencies(example, packages) {
  const packageJson = require(path.join(EXAMPLES_DIR, example, "package.json"))
  const dependencies = [].concat(
    Object.keys(packageJson.dependencies),
    Object.keys(packageJson.devDependencies)
  )

  // dependencies
  //   .filter(dependency => packages.indexOf(dependency) !== -1)
  packages.forEach(dependency => {
    execSync("yalc link " + dependency, {
      cwd: path.join(EXAMPLES_DIR, example)
    })
    console.log("Linked " + dependency)
  })
}

function linkPackage(packageName) {
  execSync("yalc publish", { cwd: path.join(BUILD_DIR, packageName) })
}

const packages = listDirs(BUILD_DIR)
const examples = listDirs(EXAMPLES_DIR)

packages.forEach(linkPackage)
examples.forEach(example => linkDependencies(example, packages))

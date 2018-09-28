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

function linkDependencies(example) {
  console.log("Linking " + example)
  const dependencies = packages.map(name => `@lingui/${name}`).join(" ")
  execSync("yalc link " + dependencies, {
    cwd: path.join(EXAMPLES_DIR, example)
  })
}

function linkPackage(packageName) {
  execSync("yalc publish", { cwd: path.join(BUILD_DIR, packageName) })
}

const packages = listDirs(BUILD_DIR)
const examples = listDirs(EXAMPLES_DIR)

packages.forEach(linkPackage)
examples.forEach(linkDependencies)

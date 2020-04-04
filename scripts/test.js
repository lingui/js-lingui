const argv = require("minimist")(process.argv.slice(2))

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")
const chalk = require("chalk")
const ora = require("ora")

const EXAMPLES_DIR = path.resolve("examples")

function listDirs(dir) {
  return fs
    .readdirSync(dir)
    .filter(dirname => fs.lstatSync(path.join(dir, dirname)).isDirectory())
}

function installExample(example) {
  const spinner = ora("Installing " + example)
  execSync("yarn", {
    cwd: path.join(EXAMPLES_DIR, example)
  })
  spinner.succeed()
}

const logHeading = message => console.log(chalk.bold("\n" + message + "\n"))

if (!argv["skip-build"]) {
  logHeading("Build packages")
  execSync("node scripts/build", { stdio: "inherit" })
}

// TODO: Replace yalc with verdaccio
// docker run -d -it --rm --name verdaccio -p 4873:4873 verdaccio/verdaccio
//
// logHeading("Install packages in examples")
// const examples = listDirs(EXAMPLES_DIR)
// examples.forEach(installExample)
//
// logHeading("Link packages with examples")
// execSync("node scripts/integration", { stdio: "inherit" })

logHeading("Run tests")
execSync("yarn test", { stdio: "inherit" })
execSync("yarn test:integration", { stdio: "inherit" })

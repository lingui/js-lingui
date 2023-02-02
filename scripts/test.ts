const argv = require("minimist")(process.argv.slice(2))

import {execSync} from "child_process"
import chalk from "chalk";

const logHeading = message => console.log(chalk.bold("\n" + message + "\n"))

if (!argv["skip-build"]) {
  logHeading("Build packages")
  execSync("yarn release:build", { stdio: "inherit" })
}

logHeading("Run tests")
execSync("yarn test", { stdio: "inherit" })
execSync("yarn test:integration", { stdio: "inherit" })

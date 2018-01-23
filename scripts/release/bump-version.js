const fs = require("fs")
const chalk = require("chalk")
const semver = require("semver")

const VERSION_FILE = "packages/version.txt"

const oldVersion = fs
  .readFileSync(VERSION_FILE)
  .toString()
  .trim()

if (!semver.valid(oldVersion)) {
  console.error(
    `Version ${oldVersion} isn't valid. Please fix ${VERSION_FILE} manually.`
  )
  process.exit(1)
}

const newVersion = semver.inc(oldVersion, "prerelease")

fs.writeFileSync(VERSION_FILE, newVersion)

console.log(chalk.green(`Bumped version to ${newVersion}`))

const fs = require("fs-extra")
const { execSync } = require("child_process")

const versionRe = /v?([^-]+-\d+).*(\r?\n|\r)/

async function getVersion(prerelease = false) {
  let version

  if (prerelease) {
    version = execSync("git describe --tags")
      .toString()
      .replace(versionRe, "$1")
  } else {
    const packageJson = await fs.readJson("package.json")
    version = packageJson.version
  }

  return version
}

module.exports = { getVersion }

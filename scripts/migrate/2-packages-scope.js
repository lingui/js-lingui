const path = require("path")
const { execSync } = require("child_process")
const ora = require("ora")

function exec(command) {
  execSync(command, { cwd, stdio: "inherit" })
}

const cwd = process.argv[2]

const packageMap = {
  "lingui-cli": "@lingui/cli",
  "lingui-conf": "@lingui/conf",
  "lingui-i18n": "@lingui/core",
  "lingui-loader": "@lingui/loader",
  "lingui-react": "@lingui/react",
  "babel-plugin-lingui-transform-js": "@lingui/babel-plugin-transform-js",
  "babel-plugin-lingui-transform-react": "@lingui/babel-plugin-transform-react",
  "babel-plugin-lingui-extract-messages":
    "@lingui/babel-plugin-extract-messages",
  "babel-preset-lingui-js": "@lingui/babel-preset-js",
  "babel-preset-lingui-react": "@lingui/babel-preset-react"
}

const packageJson = require(path.resolve(cwd, "package.json"))

const dependencies = [].concat(
  Object.keys(packageJson.dependencies),
  Object.keys(packageJson.devDependencies)
)

const packagesToRemove = dependencies.filter(
  name => packageMap[name] !== undefined
)

if (!packagesToRemove.length) {
  console.log("Nothing to migrate!")
  process.exit(0)
}

const packagesToInstall = packagesToRemove
  .filter(name => packageJson.dependencies[name] !== undefined)
  .map(name => packageMap[name])

const devPackagesToInstall = packagesToRemove
  .filter(name => packageJson.devDependencies[name] !== undefined)
  .map(name => packageMap[name])

exec(`yarn remove ${packagesToRemove.join(" ")}`)
exec(`yarn add ${packagesToInstall.join(" ")}`)
exec(`yarn add --dev ${devPackagesToInstall.join(" ")}`)

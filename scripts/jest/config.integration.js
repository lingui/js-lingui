const { readdirSync, statSync } = require("fs")
const { join } = require("path")
const sourceConfig = require("./config.unit")

// Find all folders in packages/* with package.json
const packagesRoot = join(process.cwd(), "packages")
const packages = readdirSync(packagesRoot).filter(dir => {
  if (dir.charAt(0) === ".") {
    return false
  }
  const packagePath = join(packagesRoot, dir, "package.json")
  try {
    require(packagePath)
  } catch (error) {
    return false
  }

  return true
})

const DEV_PACKAGES = ["jest-mocks"]

// Create a module map to point React packages to the build output
const moduleNameMapper = {}
packages.filter(name => !DEV_PACKAGES.includes(name)).forEach(name => {
  // Root entry point
  moduleNameMapper[`^@lingui/${name}$`] = `<rootDir>/build/packages/${name}`
  // Named entry points
  moduleNameMapper[
    `^@lingui/${name}/(.*)$`
  ] = `<rootDir>/build/packages/${name}/$1`
})

module.exports = Object.assign({}, sourceConfig, {
  roots: ["<rootDir>/packages/", "<rootDir>/examples/"],
  testPathIgnorePatterns: ["/node_modules/", "webpack-react", "vanilla-js"],
  // Redirect imports to the compiled bundles
  moduleNameMapper,

  // Exclude the build output from transforms
  transformIgnorePatterns: ["/node_modules/", "<rootDir>/build/"],
  modulePathIgnorePatterns: [".yalc/"],

  collectCoverage: false
})

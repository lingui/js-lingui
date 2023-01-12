const sourceConfig = require("./config.unit")

/**
 * @type {import('jest').Config}
 */
module.exports = {
  ...sourceConfig,

  roots: ["<rootDir>/packages/"],
  testPathIgnorePatterns: ["/node_modules/"],
  // Redirect imports to the compiled bundles
  moduleNameMapper: {},
  setupFiles: ['set-tz/utc'],

  // Exclude the build output from transforms
  transformIgnorePatterns: ["/node_modules/", "<rootDir>/packages/*/build/"],
  modulePathIgnorePatterns: [".yalc/", "/build"],

  collectCoverage: false,

  haste: {
    throwOnModuleCollision: false,
  }
}

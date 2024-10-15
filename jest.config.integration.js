const sourceConfig = require("./jest.config")

/**
 * @type {import('jest').Config}
 */
module.exports = {
  ...sourceConfig,
  projects: sourceConfig.projects.map((project) => ({
    ...project,
    // Redirect imports to the compiled bundles.
    // This is to test compiled code instead of source (applies to code under test and also its deps).
    moduleNameMapper: {},
  })),

  // Exclude the build output from transforms
  transformIgnorePatterns: ["/node_modules/", "<rootDir>/packages/*/build/"],
}

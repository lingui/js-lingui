const { pathsToModuleNameMapper } = require("ts-jest")
const tsConfig = require("./tsconfig.json")

const tsConfigPathMapping = pathsToModuleNameMapper(
  tsConfig.compilerOptions.paths,
  {
    prefix: "<rootDir>/",
  }
)

const testMatch = ["**/?(*.)test.(js|ts|tsx)", "**/test/index.(js|ts|tsx)"]

/**
 * @type {import('jest').Config}
 */
module.exports = {
  roots: ["<rootDir>/packages/"],
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/*.test-d.{ts,tsx}",
    "!**/node_modules/**",
    "!**/build/**",
    "!**/fixtures/**",
  ],
  coverageDirectory: "<rootDir>/coverage/",
  coveragePathIgnorePatterns: [
    "node_modules",
    "scripts",
    "test",
    ".*.json$",
    ".*.js.snap$",
  ],
  coverageReporters: ["lcov", "text"],

  globalSetup: "./scripts/jest/setupTimezone.js",
  projects: [
    {
      displayName: "web",
      testEnvironment: "jsdom",
      testMatch,
      moduleNameMapper: tsConfigPathMapping,
      roots: [
        "<rootDir>/packages/core",
        "<rootDir>/packages/react",
        "<rootDir>/packages/remote-loader",
      ],
    },
    {
      displayName: "node",
      testEnvironment: "node",
      testMatch,
      moduleNameMapper: tsConfigPathMapping,
      snapshotSerializers: [
        require.resolve("./scripts/jest/stripAnsiSerializer.js"),
      ],
      setupFilesAfterEnv: [require.resolve("./scripts/jest/env.js")],
      roots: [
        "<rootDir>/packages/babel-plugin-extract-messages",
        "<rootDir>/packages/cli",
        "<rootDir>/packages/conf",
        "<rootDir>/packages/loader",
        "<rootDir>/packages/macro",
        "<rootDir>/packages/vite-plugin",
        "<rootDir>/packages/format-po",
        "<rootDir>/packages/format-po-gettext",
        "<rootDir>/packages/format-json",
        "<rootDir>/packages/format-csv",
      ],
    },
  ],
}

const { pathsToModuleNameMapper } = require('ts-jest/utils');
const tsConfig = require( './tsconfig.json');

/**
 * @type {import('jest').Config}
 */
module.exports = {
  roots: ["<rootDir>/packages/"],
  rootDir: process.cwd(),
  testMatch: ["**/?(*.)test.(js|ts|tsx)", "**/test/index.(js|ts|tsx)"],
  testPathIgnorePatterns: ["/node_modules/", "/locale/"],
  testURL: "http://localhost",

  collectCoverage: true,
  coverageDirectory: "<rootDir>/coverage/",
  coveragePathIgnorePatterns: [
    "node_modules",
    "scripts",
    // removed because detect-locale package is ignored
    // "locale",
    "fixtures",
    ".*.json$",
    ".*.js.snap$",
  ],
  coverageReporters: ["html", "lcov", "text"],
  modulePathIgnorePatterns: ["/build"],
  moduleNameMapper: pathsToModuleNameMapper(tsConfig.compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),

  reporters: ["default", "jest-junit"],
  setupFiles: ['set-tz/utc'],
  setupFilesAfterEnv: [require.resolve("./scripts/jest/env.js")],
  snapshotSerializers: [
    "jest-serializer-html",
    require.resolve("./scripts/jest/stripAnsiSerializer.js"),
  ],
}

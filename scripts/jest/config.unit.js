module.exports = {
  roots: ["<rootDir>/packages/"],
  rootDir: process.cwd(),
  testMatch: ["**/?(*.)test.js", "**/test/index.js"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/locale/",
    "packages/typescript-extract-messages"
  ],

  collectCoverage: true,
  coverageDirectory: "<rootDir>/coverage/",
  coveragePathIgnorePatterns: ["node_modules", "scripts", "locale", ".*.json$"],
  coverageReporters: ["html", "lcov"],

  reporters: ["default", "jest-junit"],
  setupTestFrameworkScriptFile: require.resolve("./env.js"),
  snapshotSerializers: ["enzyme-to-json/serializer"]
}

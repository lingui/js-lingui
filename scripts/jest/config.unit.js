module.exports = {
  roots: ["<rootDir>/packages/"],
  rootDir: process.cwd(),
  testMatch: ["**/?(*.)test.js", "**/test/index.js"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/locale/",
    "packages/typescript-extract-messages"
  ],
  testURL: "http://localhost",

  collectCoverage: true,
  coverageDirectory: "<rootDir>/coverage/",
  coveragePathIgnorePatterns: [
    "node_modules",
    "scripts",
    "locale",
    ".*.json$",
    ".*.js.snap$"
  ],
  coverageReporters: ["html", "lcov"],

  reporters: ["default", "jest-junit"],
  setupTestFrameworkScriptFile: require.resolve("./env.js"),
  snapshotSerializers: [
    "enzyme-to-json/serializer",
    "jest-serializer-html",
    require.resolve("./stripAnsiSerializer.js")
  ]
}

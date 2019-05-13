module.exports = {
  roots: ["<rootDir>/packages/"],
  rootDir: process.cwd(),
  testMatch: ["**/?(*.)test.(js|ts)", "**/test/index.(js|ts)"],
  testPathIgnorePatterns: ["/node_modules/", "/locale/"],
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
  setupFilesAfterEnv: [require.resolve("./env.js")],
  snapshotSerializers: [
    "enzyme-to-json/serializer",
    "jest-serializer-html",
    require.resolve("./stripAnsiSerializer.js")
  ]
}

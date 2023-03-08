/**
 * @type {import("jest").Config}
 */
module.exports = {
  displayName: "tsd",
  testMatch: ["**/__typetests__/*.test-d.{ts,tsx}"],
  runner: "jest-runner-tsd",
  roots: ["<rootDir>/packages/"],
}

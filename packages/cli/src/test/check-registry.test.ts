import {
  getCheck,
  getRegisteredChecks,
  validateSupportedOptions,
} from "../api/check/index.js"
import { runCheck } from "../lingui-check.js"
import { createFixtures } from "../tests.js"
import { getTestConfig, workersOptions } from "./checkTestUtils.js"

describe("Check Registry", () => {
  it("Should reject unknown checks during direct resolution", () => {
    expect(() => getCheck("unknown")).toThrow("Unknown check")
  })

  it("Should expose all registered checks", () => {
    expect(getRegisteredChecks().map((check) => check.name)).toEqual([
      "sync",
      "missing",
    ])
  })

  it("Should reject clean with the missing check only", () => {
    expect(() =>
      validateSupportedOptions(getCheck("missing"), {
        clean: true,
        workersOptions,
      }),
    ).toThrow("Option `--clean` can only be used with the `sync` check.")
  })

  it("Should reject overwrite with the missing check only", () => {
    expect(() =>
      validateSupportedOptions(getCheck("missing"), {
        overwrite: true,
        workersOptions,
      }),
    ).toThrow("Option `--overwrite` can only be used with the `sync` check.")
  })

  it("Should reject missing behavior with the sync check only", () => {
    expect(() =>
      validateSupportedOptions(getCheck("sync"), {
        missingBehavior: "catalog",
        workersOptions,
      }),
    ).toThrow("Option `--mode` can only be used with the `missing` check.")
  })

  it("Should reject unsupported options through runCheck", async () => {
    const rootDir = await createFixtures({
      "src/app.ts": `
import { t } from "@lingui/core/macro"

t\`Hello World\`
        `,
    })

    const config = getTestConfig(rootDir)

    await expect(
      runCheck(config, "missing", {
        clean: true,
        workersOptions,
      }),
    ).rejects.toThrow(
      "Option `--clean` can only be used with the `sync` check.",
    )
  })
})

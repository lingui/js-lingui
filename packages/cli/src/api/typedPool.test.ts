import { existsSync } from "node:fs"
import { Tinypool } from "tinypool"
import { afterEach, describe, expect, test, vi } from "vitest"
import { createWorkerPool } from "./typedPool.js"

vi.mock("tinypool")

afterEach(() => {
  vi.clearAllMocks()
  vi.unstubAllEnvs()
})

const workerPaths = [
  "../workers/compileWorkerWrapper",
  "../workers/extractWorkerWrapper",
  "../extract-experimental/workers/extractWorkerWrapper",
  "../workers/missingWorkerWrapper",
] as const

describe.each(["test", "production", "development", undefined])(
  "worker resolution with NODE_ENV=%s",
  (environment) => {
    test.each(workerPaths)(
      "uses shipped JavaScript for %s from a built module",
      (workerPath) => {
        vi.stubEnv("NODE_ENV", environment)
        const baseUrl = new URL(
          "../../dist/api/workerPools.js",
          import.meta.url,
        )

        createWorkerPool(workerPath, baseUrl.href, 1)

        expect(Tinypool).toHaveBeenCalledExactlyOnceWith({
          filename: new URL(`${workerPath}.prod.js`, baseUrl).href,
          minThreads: 1,
          maxThreads: 1,
        })
      },
    )

    test.each(workerPaths)(
      "uses an existing source harness for %s from a TypeScript module",
      (workerPath) => {
        vi.stubEnv("NODE_ENV", environment)
        const baseUrl = new URL("./workerPools.ts", import.meta.url)
        const wrapperUrl = new URL(`${workerPath}.jiti.js`, baseUrl)

        createWorkerPool(workerPath, baseUrl.href, 1)

        expect(Tinypool).toHaveBeenCalledExactlyOnceWith({
          filename: wrapperUrl.href,
          minThreads: 1,
          maxThreads: 1,
        })
        expect(existsSync(wrapperUrl)).toBe(true)
      },
    )
  },
)

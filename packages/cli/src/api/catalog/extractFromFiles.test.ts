import type { ExtractedMessage } from "@lingui/conf"
import { makeConfig } from "@lingui/conf"
import { describe, expect, it, vi } from "vitest"
import type { ExtractWorkerPool } from "../workerPools.js"

vi.mock("../extractors/index.js", () => ({
  default: vi.fn().mockResolvedValue(true),
}))

import {
  extractFromFilesWithWorkerPool,
  mergeExtractedMessage,
} from "./extractFromFiles.js"

describe("mergeExtractedMessage", () => {
  const rootDir = "/project"

  it("sorts origins by file path then line number", () => {
    const config = makeConfig(
      { rootDir, sourceLocale: "en", locales: ["en"] },
      { skipValidation: true },
    )
    const messages = {}

    const base = (line: number): ExtractedMessage => ({
      id: "shared",
      message: "Hello",
      origin: [`${rootDir}/src/x.ts`, line],
    })

    mergeExtractedMessage(base(20), messages, config)
    mergeExtractedMessage(base(5), messages, config)

    expect(messages).toMatchObject({
      shared: {
        origin: [
          ["src/x.ts", 5],
          ["src/x.ts", 20],
        ],
      },
    })
  })
})

describe("extractFromFilesWithWorkerPool", () => {
  const rootDir = "/project"
  const resolvedConfigPath = "/project/lingui.config.js"

  it("merges each file in paths order (not worker completion order)", async () => {
    const config = makeConfig(
      {
        rootDir,
        sourceLocale: "en",
        locales: ["en"],
      },
      { skipValidation: true, resolvedConfigPath },
    )

    const paths = [`${rootDir}/z.ts`, `${rootDir}/a.ts`]

    const msg = (file: string): ExtractedMessage => ({
      id: "one",
      message: "Hi",
      origin: [file, 1],
    })

    const run = vi
      .fn()
      .mockImplementation(async (filename: string) => {
        if (filename.endsWith("z.ts")) {
          await new Promise((r) => setTimeout(r, 5))
          return { success: true as const, messages: [msg(`${rootDir}/z.ts`)] }
        }
        return { success: true as const, messages: [msg(`${rootDir}/a.ts`)] }
      })

    const pool = { run, destroy: vi.fn() } as unknown as ExtractWorkerPool

    const catalog = await extractFromFilesWithWorkerPool(pool, paths, config)

    expect(run).toHaveBeenCalledTimes(2)
    expect(catalog?.one?.origin).toEqual([
      ["a.ts", 1],
      ["z.ts", 1],
    ])
  })
})

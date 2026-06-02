import path from "path"
import type {
  Experimental__BatchExtractorType,
  ExtractedMessage,
} from "@lingui/conf"
import { makeConfig } from "@lingui/conf"
import { describe, expect, it, vi } from "vitest"
import { Catalog } from "../catalog.js"
import { getFormat } from "../formats/index.js"

const fixturesDir = path.resolve(__dirname, "../fixtures")
const collectDir = path.join(fixturesDir, "collect")

async function makeCatalogWithExtractor(
  extractor: Experimental__BatchExtractorType,
) {
  const config = makeConfig(
    {
      rootDir: fixturesDir,
      locales: ["en"],
      sourceLocale: "en",
      extractors: [extractor],
    },
    { skipValidation: true },
  )

  return new Catalog(
    {
      name: "messages",
      path: "locales/{locale}/messages",
      include: [collectDir],
      exclude: [],
      format: await getFormat(config.format, config.sourceLocale),
    },
    config,
  )
}

describe("Catalog.collect with batch extractor", () => {
  it("passes all source paths to extractFromFiles", async () => {
    const extractFromFilesFn: Experimental__BatchExtractorType["extractFromFiles"] =
      vi.fn(async () => {})

    const extractor: Experimental__BatchExtractorType = {
      extractFromFiles: extractFromFilesFn,
    }

    const catalog = await makeCatalogWithExtractor(extractor)
    await catalog.collect()

    const mock = vi.mocked(extractFromFilesFn)
    expect(mock).toHaveBeenCalledTimes(1)
    const filenames = mock.mock.calls[0]![0]
    expect(filenames.length).toBeGreaterThan(0)
    expect(filenames.every((f) => path.isAbsolute(f))).toBe(true)
  })

  it("merges extracted messages into catalog", async () => {
    const extractor: Experimental__BatchExtractorType = {
      extractFromFiles: async (
        filenames: string[],
        onMessageExtracted: (msg: ExtractedMessage) => void,
      ) => {
        onMessageExtracted({
          id: "msg.hello",
          message: "Hello",
          origin: [filenames[0]!, 1],
        })
        onMessageExtracted({
          id: "msg.world",
          message: "World",
          origin: [filenames[0]!, 5],
        })
      },
    }

    const catalog = await makeCatalogWithExtractor(extractor)
    const result = await catalog.collect()

    expect(result).toBeDefined()
    expect(result!["msg.hello"]?.message).toBe("Hello")
    expect(result!["msg.world"]?.message).toBe("World")
  })

  it("returns undefined on extractor error", async () => {
    const extractor: Experimental__BatchExtractorType = {
      extractFromFiles: async () => {
        throw new Error("native crash")
      },
    }

    const catalog = await makeCatalogWithExtractor(extractor)
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    const result = await catalog.collect()
    consoleSpy.mockRestore()

    expect(result).toBeUndefined()
  })

  it("skips worker pool even when provided", async () => {
    const extractFromFilesFn = vi.fn(async () => {})

    const extractor: Experimental__BatchExtractorType = {
      extractFromFiles: extractFromFilesFn,
    }

    const catalog = await makeCatalogWithExtractor(extractor)
    const run = vi.fn()
    const pool = { run, destroy: vi.fn() } as any

    await catalog.collect({ workerPool: pool })

    expect(extractFromFilesFn).toHaveBeenCalledTimes(1)
    expect(run).not.toHaveBeenCalled()
  })
})

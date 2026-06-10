import path from "path"
import type {
  Experimental__BatchExtractorType,
  ExtractedMessage,
  ExtractorType,
  PerFileExtractorType,
} from "@lingui/conf"
import { makeConfig } from "@lingui/conf"
import { describe, expect, it, vi } from "vitest"
import { Catalog } from "../catalog.js"
import { getFormat } from "../formats/index.js"
import { mockConsole } from "@lingui/test-utils"

const fixturesDir = path.resolve(import.meta.dirname, "../fixtures")
const collectDir = path.join(fixturesDir, "collect")

const matchAll = () => true

async function makeCatalogWithExtractors(extractors: ExtractorType[]) {
  const config = makeConfig(
    {
      rootDir: fixturesDir,
      locales: ["en"],
      sourceLocale: "en",
      extractors,
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
  it("passes matched paths to extractFromFiles", async () => {
    const extractFromFilesFn: Experimental__BatchExtractorType["extractFromFiles"] =
      vi.fn(async () => {})

    const extractor: Experimental__BatchExtractorType = {
      match: matchAll,
      extractFromFiles: extractFromFilesFn,
    }

    const catalog = await makeCatalogWithExtractors([extractor])
    await catalog.collect()

    const mock = vi.mocked(extractFromFilesFn)
    expect(mock).toHaveBeenCalledTimes(1)
    const filenames = mock.mock.calls[0]![0]
    expect(filenames.length).toBeGreaterThan(0)
    expect(filenames.every((f) => path.isAbsolute(f))).toBe(true)
  })

  it("merges extracted messages into catalog", async () => {
    const extractor: Experimental__BatchExtractorType = {
      match: matchAll,
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

    const catalog = await makeCatalogWithExtractors([extractor])
    const result = await catalog.collect()

    expect(result).toBeDefined()
    expect(result!["msg.hello"]?.message).toBe("Hello")
    expect(result!["msg.world"]?.message).toBe("World")
  })

  it("should throw an error when duplicate identifier with different defaults found", async () => {
    const extractor: Experimental__BatchExtractorType = {
      match: matchAll,
      extractFromFiles: async (
        filenames: string[],
        onMessageExtracted: (msg: ExtractedMessage) => void,
      ) => {
        onMessageExtracted({
          id: "custom.id",
          message: "Hello",
          origin: [filenames[0]!, 1],
        })
        onMessageExtracted({
          id: "custom.id",
          message: "World",
          origin: [filenames[0]!, 5],
        })
      },
    }

    const catalog = await makeCatalogWithExtractors([extractor])

    expect.assertions(2)
    await mockConsole(async (console) => {
      const result = await catalog.collect()

      expect(result).toBeUndefined()

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining(
          `Encountered different default translations for message`,
        ),
      )
    })
  })

  it("returns undefined on extractor error", async () => {
    const extractor: Experimental__BatchExtractorType = {
      match: matchAll,
      extractFromFiles: async () => {
        throw new Error("native crash")
      },
    }

    const catalog = await makeCatalogWithExtractors([extractor])
    await mockConsole(async (console) => {
      const result = await catalog.collect()

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining(`native crash`),
      )
      expect(result).toBeUndefined()
    })
  })

  it("skips worker pool for batch extractor", async () => {
    const extractFromFilesFn = vi.fn(async () => {})

    const extractor: Experimental__BatchExtractorType = {
      match: matchAll,
      extractFromFiles: extractFromFilesFn,
    }

    const catalog = await makeCatalogWithExtractors([extractor])
    const run = vi.fn()
    const pool = { run, destroy: vi.fn() } as any

    await catalog.collect({ workerPool: pool })

    expect(extractFromFilesFn).toHaveBeenCalledTimes(1)
    expect(run).not.toHaveBeenCalled()
  })

  it("only passes files matching the batch extractor's match()", async () => {
    const extractFromFilesFn: Experimental__BatchExtractorType["extractFromFiles"] =
      vi.fn(async () => {})

    const extractor: Experimental__BatchExtractorType = {
      match: (f) => f.endsWith(".js"),
      extractFromFiles: extractFromFilesFn,
    }

    const catalog = await makeCatalogWithExtractors([extractor])
    await catalog.collect()

    const mock = vi.mocked(extractFromFilesFn)
    expect(mock).toHaveBeenCalledTimes(1)
    const filenames = mock.mock.calls[0]![0]
    expect(filenames.length).toBeGreaterThan(0)
    expect(filenames.every((f: string) => f.endsWith(".js"))).toBe(true)
  })

  it("processes extractors in order, popping matched files", async () => {
    const batchFn: Experimental__BatchExtractorType["extractFromFiles"] = vi.fn(
      async () => {},
    )
    const perFileFn = vi.fn()

    const batchExtractor: Experimental__BatchExtractorType = {
      match: (f) => f.endsWith(".js"),
      extractFromFiles: batchFn,
    }

    const perFileExtractor: PerFileExtractorType = {
      match: matchAll,
      extract: perFileFn,
    }

    const catalog = await makeCatalogWithExtractors([
      batchExtractor,
      perFileExtractor,
    ])
    await catalog.collect()

    const batchFiles = vi.mocked(batchFn).mock.calls[0]![0]
    expect(batchFiles.every((f: string) => f.endsWith(".js"))).toBe(true)
  })

  it("merges messages with the same id from different files", async () => {
    const extractor: Experimental__BatchExtractorType = {
      match: matchAll,
      extractFromFiles: async (filenames, onMessageExtracted) => {
        onMessageExtracted({
          id: "msg.shared",
          message: "Hello",
          origin: [filenames[0]!, 10],
        })
        onMessageExtracted({
          id: "msg.shared",
          message: "Hello",
          origin: [filenames[1]!, 5],
        })
        onMessageExtracted({
          id: "msg.shared",
          message: "Hello",
          origin: [filenames[2]!, 20],
        })
      },
    }

    const catalog = await makeCatalogWithExtractors([extractor])
    const result = (await catalog.collect())!

    expect(result).toBeDefined()
    expect(Object.keys(result)).toHaveLength(1)
    const msg = result["msg.shared"]!
    expect(msg.message).toBe("Hello")
    expect(msg.origin).toHaveLength(3)

    // origins are sorted by file path
    const filePaths = msg.origin.map(([file]) => file)
    expect(filePaths).toEqual([...filePaths].sort())
  })

  it("handles two batch extractors and one per-file extractor with distinct file types", async () => {
    const jsBatchFn: Experimental__BatchExtractorType["extractFromFiles"] =
      vi.fn(async (filenames, onMsg) => {
        for (const f of filenames) {
          onMsg({
            id: `js:${path.basename(f)}`,
            message: "from js batch",
            origin: [f, 1],
          })
        }
      })

    const tsBatchFn: Experimental__BatchExtractorType["extractFromFiles"] =
      vi.fn(async (filenames, onMsg) => {
        for (const f of filenames) {
          onMsg({
            id: `ts:${path.basename(f)}`,
            message: "from ts batch",
            origin: [f, 1],
          })
        }
      })

    const vueExtractFn: PerFileExtractorType["extract"] = vi.fn(
      async (filename, _code, onMsg) => {
        onMsg({ id: `vue:${path.basename(filename)}`, message: "from vue" })
      },
    )

    const jsBatch: Experimental__BatchExtractorType = {
      match: (f) => f.endsWith(".js"),
      extractFromFiles: jsBatchFn,
    }

    const tsBatch: Experimental__BatchExtractorType = {
      match: (f) => f.endsWith(".ts"),
      extractFromFiles: tsBatchFn,
    }

    const vuePerFile: PerFileExtractorType = {
      match: (f) => f.endsWith(".vue"),
      extract: vueExtractFn,
    }

    const catalog = await makeCatalogWithExtractors([
      jsBatch,
      tsBatch,
      vuePerFile,
    ])
    const result = await catalog.collect()

    // js batch received only .js files
    const jsFiles = vi.mocked(jsBatchFn).mock.calls[0]![0]
    expect(jsFiles.length).toBeGreaterThan(0)
    expect(jsFiles.every((f: string) => f.endsWith(".js"))).toBe(true)

    // ts batch received only .ts files
    const tsFiles = vi.mocked(tsBatchFn).mock.calls[0]![0]
    expect(tsFiles.length).toBeGreaterThan(0)
    expect(tsFiles.every((f: string) => f.endsWith(".ts"))).toBe(true)

    // vue per-file extractor was called with .vue file
    expect(vueExtractFn).toHaveBeenCalled()
    const vueFilename = vi.mocked(vueExtractFn).mock.calls[0]![0]
    expect(vueFilename.endsWith(".vue")).toBe(true)

    // all messages merged into the catalog
    expect(result).toBeDefined()
    expect(Object.keys(result!).some((k) => k.startsWith("js:"))).toBe(true)
    expect(Object.keys(result!).some((k) => k.startsWith("ts:"))).toBe(true)
    expect(Object.keys(result!).some((k) => k.startsWith("vue:"))).toBe(true)
  })
})

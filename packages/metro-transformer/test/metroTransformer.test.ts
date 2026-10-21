import path from "path"
import {
  createLinguiMetroTransformer,
  transformFile,
} from "../src/metroTransformer"
import type {
  BabelTransformer,
  BabelTransformerCacheKeyArgs,
} from "../src/types"
import { version } from "../package.json"

describe("Lingui Metro transformer tests", () => {
  const priorEnv = process.env.LINGUI_CONFIG
  const priorCwd = process.cwd()
  const testProjectDir = path.join(__dirname, "__fixtures__", "test-project")
  const catalogsDir = path.join(testProjectDir, "locales")

  beforeAll(() => {
    process.chdir(testProjectDir)
  })
  afterAll(() => {
    process.env.LINGUI_CONFIG = priorEnv
    process.chdir(priorCwd)
  })

  it("should transform English PO file to a JS export", async () => {
    const filename = path.relative(
      testProjectDir,
      path.join(catalogsDir, "en", "messages.po"),
    )
    const result = await transformFile({
      filename,
    })

    expect(result).toMatchInlineSnapshot(
      `"/*eslint-disable*/export const messages=JSON.parse("{\\"dEgA5A\\":[\\"Cancel\\"],\\"p1AaTM\\":[\\"Add a message to your inbox\\"]}");"`,
    )
  })

  it("should transform Czech PO file with fallback to English to a JS export", async () => {
    const filename = path.relative(
      testProjectDir,
      path.join(catalogsDir, "cs", "messages.po"),
    )
    const result = await transformFile({
      filename,
    })

    expect(result).toMatchInlineSnapshot(
      `"/*eslint-disable*/export const messages=JSON.parse("{\\"dEgA5A\\":[\\"Cancel\\"],\\"p1AaTM\\":[\\"Přidat zprávu do doručené pošty\\"]}");"`,
    )
  })

  it("given a valid absolute path (not relative to lingui config root), transformer will turn it into path relative to lingui config and succeed", async () => {
    // this is not how the `transformFile` function would be called in a real project and covers an implementation detail
    const filename = path.join(catalogsDir, "en", "messages.po")

    const result = await transformFile({
      filename,
    })

    expect(result).toMatchInlineSnapshot(
      `"/*eslint-disable*/export const messages=JSON.parse("{\\"dEgA5A\\":[\\"Cancel\\"],\\"p1AaTM\\":[\\"Add a message to your inbox\\"]}");"`,
    )
  })

  it("should throw an error when provided path is invalid", async () => {
    const filename = path.join(
      catalogsDir,
      "some",
      "bad",
      "path",
      "messages.po",
    )
    await expect(
      transformFile({
        filename,
      }),
    ).rejects.toThrow(/is not matched to any of your catalogs paths/)
  })

  it("should hand non-PO files to the upstream transformer untouched", async () => {
    const transform = vi.fn(async () => ({ ast: null, metadata: null }))
    const transformer = createLinguiMetroTransformer({ transform })
    const params = {
      filename: "src/index.ts",
      options: {},
      src: "export const answer = 42",
    }

    await transformer.transform(params)

    expect(transform).toHaveBeenCalledWith(params)
  })

  it("should compile PO files and hand the compiled catalog to the upstream transformer", async () => {
    const transform = vi.fn(async () => ({ ast: null, metadata: null }))
    const transformer = createLinguiMetroTransformer({ transform })
    const filename = path.relative(
      testProjectDir,
      path.join(catalogsDir, "en", "messages.po"),
    )

    await transformer.transform({
      filename,
      options: {},
      src: 'msgid "Cancel"\nmsgstr "Cancel"\n',
    })

    expect(transform).toHaveBeenCalledWith({
      filename,
      options: {},
      src: await transformFile({ filename }),
    })
  })
})

describe("Lingui Metro transformer cache key", () => {
  const createUpstreamTransformer = (
    getCacheKey?: BabelTransformer["getCacheKey"],
  ): BabelTransformer => ({
    transform: async () => ({ ast: null, metadata: null }),
    getCacheKey,
  })

  it("should derive the key from the upstream key and this package's version", () => {
    const transformer = createLinguiMetroTransformer(
      createUpstreamTransformer(() => "upstream-key"),
    )

    expect(transformer.getCacheKey()).toBe(
      `upstream-key$@lingui/metro-transformer@${version}`,
    )
  })

  it("should change when the upstream key changes, so babel config edits invalidate the cache", () => {
    let upstreamKey = "upstream-key"
    const transformer = createLinguiMetroTransformer(
      createUpstreamTransformer(() => upstreamKey),
    )

    const before = transformer.getCacheKey()
    upstreamKey = "upstream-key-after-babel-config-edit"

    expect(transformer.getCacheKey()).not.toBe(before)
  })

  it("should forward its arguments, which Expo needs to derive a key at all", () => {
    const getCacheKey = vi.fn(
      (args?: BabelTransformerCacheKeyArgs) => args?.projectRoot ?? "",
    )
    const transformer = createLinguiMetroTransformer(
      createUpstreamTransformer(getCacheKey),
    )

    const key = transformer.getCacheKey({ projectRoot: "/some/project" })

    expect(getCacheKey).toHaveBeenCalledWith({ projectRoot: "/some/project" })
    expect(key).not.toBe(transformer.getCacheKey({ projectRoot: "/other" }))
  })

  it("should still produce a key when the upstream transformer has none", () => {
    const transformer = createLinguiMetroTransformer(
      createUpstreamTransformer(),
    )

    expect(transformer.getCacheKey()).toBe(
      `$@lingui/metro-transformer@${version}`,
    )
  })
})

describe("Lingui Metro transformer entrypoints", () => {
  it.for(["../src/expo", "../src/react-native"])(
    "%s should export both transform and getCacheKey",
    async (entrypoint) => {
      const transformer = await import(entrypoint)

      expect(typeof transformer.transform).toBe("function")
      expect(typeof transformer.getCacheKey).toBe("function")
      expect(transformer.getCacheKey()).toBe(
        `upstream-key$@lingui/metro-transformer@${version}`,
      )
    },
  )
})

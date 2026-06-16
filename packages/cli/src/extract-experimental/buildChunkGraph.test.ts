import type { BundleChunk } from "@lingui/conf"
import { buildChunkGraph } from "./buildChunkGraph.js"

describe("buildChunkGraph", () => {
  it("should return empty array for no chunks", () => {
    expect(buildChunkGraph([])).toEqual([])
  })

  it("should return entry chunk pointing to itself", () => {
    const chunks: BundleChunk[] = [
      {
        id: "entry.js",
        filePath: "/out/entry.js",
        entryPoint: "/src/entry.ts",
        imports: [],
      },
    ]

    const result = buildChunkGraph(chunks)

    expect(result).toEqual([
      { filePath: "/out/entry.js", entryPoints: ["/src/entry.ts"] },
    ])
  })

  it("should attribute shared chunk to all importing entry points", () => {
    const chunks: BundleChunk[] = [
      {
        id: "page-a.js",
        filePath: "/out/page-a.js",
        entryPoint: "/src/page-a.ts",
        imports: ["shared.js"],
      },
      {
        id: "page-b.js",
        filePath: "/out/page-b.js",
        entryPoint: "/src/page-b.ts",
        imports: ["shared.js"],
      },
      { id: "shared.js", filePath: "/out/shared.js", imports: [] },
    ]

    const result = buildChunkGraph(chunks)
    const shared = result.find((r) => r.filePath === "/out/shared.js")

    expect(shared!.entryPoints).toHaveLength(2)
    expect(shared!.entryPoints).toContain("/src/page-a.ts")
    expect(shared!.entryPoints).toContain("/src/page-b.ts")
  })

  it("should traverse transitive imports", () => {
    const chunks: BundleChunk[] = [
      {
        id: "entry.js",
        filePath: "/out/entry.js",
        entryPoint: "/src/entry.ts",
        imports: ["mid.js"],
      },
      { id: "mid.js", filePath: "/out/mid.js", imports: ["leaf.js"] },
      { id: "leaf.js", filePath: "/out/leaf.js", imports: [] },
    ]

    const result = buildChunkGraph(chunks)
    const leaf = result.find((r) => r.filePath === "/out/leaf.js")

    expect(leaf!.entryPoints).toEqual(["/src/entry.ts"])
  })

  it("should handle circular imports without infinite loop", () => {
    const chunks: BundleChunk[] = [
      {
        id: "entry.js",
        filePath: "/out/entry.js",
        entryPoint: "/src/entry.ts",
        imports: ["a.js"],
      },
      { id: "a.js", filePath: "/out/a.js", imports: ["b.js"] },
      { id: "b.js", filePath: "/out/b.js", imports: ["a.js"] },
    ]

    const result = buildChunkGraph(chunks)

    expect(result.find((r) => r.filePath === "/out/a.js")!.entryPoints).toEqual(
      ["/src/entry.ts"],
    )
    expect(result.find((r) => r.filePath === "/out/b.js")!.entryPoints).toEqual(
      ["/src/entry.ts"],
    )
  })

  it("should skip non-entry chunks that are not reachable from any entry", () => {
    const chunks: BundleChunk[] = [
      {
        id: "entry.js",
        filePath: "/out/entry.js",
        entryPoint: "/src/entry.ts",
        imports: [],
      },
      { id: "orphan.js", filePath: "/out/orphan.js", imports: [] },
    ]

    const result = buildChunkGraph(chunks)

    expect(result.find((r) => r.filePath === "/out/orphan.js")).toBeUndefined()
  })

  it("should handle multiple entry points importing the same transitive chain", () => {
    const chunks: BundleChunk[] = [
      {
        id: "e1.js",
        filePath: "/out/e1.js",
        entryPoint: "/src/e1.ts",
        imports: ["common.js"],
      },
      {
        id: "e2.js",
        filePath: "/out/e2.js",
        entryPoint: "/src/e2.ts",
        imports: ["common.js"],
      },
      { id: "common.js", filePath: "/out/common.js", imports: ["utils.js"] },
      { id: "utils.js", filePath: "/out/utils.js", imports: [] },
    ]

    const result = buildChunkGraph(chunks)
    const utils = result.find((r) => r.filePath === "/out/utils.js")

    expect(utils!.entryPoints).toHaveLength(2)
    expect(utils!.entryPoints).toContain("/src/e1.ts")
    expect(utils!.entryPoints).toContain("/src/e2.ts")
  })
})

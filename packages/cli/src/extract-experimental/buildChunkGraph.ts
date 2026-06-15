import type { BundleChunk } from "@lingui/conf"

/**
 * Traverse the chunk import graph (BFS from each entry chunk) to determine
 * which entry points depend on each chunk. This lets us extract messages from
 * shared/common chunks once and attribute them to all consuming entry catalogs.
 */
export function buildChunkGraph(
  rawChunks: BundleChunk[],
): Array<{ filePath: string; entryPoints: string[] }> {
  const chunkById = new Map(rawChunks.map((c) => [c.id, c]))
  const chunkToEntries = new Map<string, Set<string>>()

  for (const chunk of rawChunks) {
    if (!chunk.entryPoint) continue

    const queue = [chunk.id]
    const visited = new Set<string>()

    while (queue.length > 0) {
      const currentId = queue.pop()!
      if (visited.has(currentId)) continue
      visited.add(currentId)

      if (!chunkToEntries.has(currentId)) {
        chunkToEntries.set(currentId, new Set())
      }
      chunkToEntries.get(currentId)!.add(chunk.entryPoint)

      const current = chunkById.get(currentId)
      if (current) {
        for (const imp of current.imports) {
          if (chunkById.has(imp)) {
            queue.push(imp)
          }
        }
      }
    }
  }

  return Array.from(chunkToEntries.entries()).map(([id, entries]) => ({
    filePath: chunkById.get(id)!.filePath,
    entryPoints: Array.from(entries),
  }))
}

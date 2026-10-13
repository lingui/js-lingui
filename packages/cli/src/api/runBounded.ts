export async function runBounded<T, R>(
  items: readonly T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length)
  const workerCount = Math.min(Math.max(concurrency, 1), items.length)
  let nextIndex = 0

  const pool = Array.from({ length: workerCount }, async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex++
      results[currentIndex] = await worker(items[currentIndex]!, currentIndex)
    }
  })

  await Promise.all(pool)

  return results
}

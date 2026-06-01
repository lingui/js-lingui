import { performance } from "node:perf_hooks"
import { describe, expect, test } from "vitest"

import {
  defaultMergeOptions,
  makeNextMessage,
  makePrevMessage,
} from "../../tests.js"
import { mergeCatalog } from "./mergeCatalog.js"
import { CatalogType, ExtractedCatalogType } from "../types.js"

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b)

  return sorted[Math.floor(sorted.length / 2)]!
}

function measure(fn: () => void, runs = 15) {
  const times: number[] = []

  // Warm-up for JIT
  for (let i = 0; i < 20; i++) {
    fn()
  }

  for (let i = 0; i < runs; i++) {
    const start = performance.now()
    fn()
    const end = performance.now()

    times.push(end - start)
  }

  return median(times)
}

function makePrevCatalog(size: number) {
  return Object.fromEntries(
    Array.from({ length: size }, (_, index) => [
      `prev.${index}`,
      makePrevMessage({ translation: `Translation ${index}` }),
    ]),
  ) as CatalogType
}

function makeNextCatalog(size: number) {
  return Object.fromEntries(
    Array.from({ length: size }, (_, index) => [
      `next.${index}`,
      makeNextMessage({ message: `Message ${index}` }),
    ]),
  ) as ExtractedCatalogType
}

describe("mergeCatalog performance", () => {
  test("merge scales approximately linearly", () => {
    const sizes = [1_000, 2_000, 4_000, 8_000]

    const measurements = sizes.map((size) => {
      const prevCatalog = makePrevCatalog(size)
      const nextCatalog = makeNextCatalog(size)

      return {
        size,
        timeMs: measure(() => {
          mergeCatalog(prevCatalog, nextCatalog, false, defaultMergeOptions)
        }),
      }
    })

    const small = measurements[0]!
    const large = measurements[measurements.length - 1]!
    const inputGrowth = large.size / small.size
    const timeGrowth = large.timeMs / small.timeMs

    // Allow CI noise while still keeping the budget well below quadratic growth.
    expect(timeGrowth).toBeLessThan(inputGrowth * 3)
  })
})

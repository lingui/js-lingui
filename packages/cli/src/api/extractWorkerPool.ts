import { Pool, spawn, Worker } from "threads"
import type { ExtractWorkerFunction } from "../workers/extractWorker.js"

export type ExtractWorkerPool = ReturnType<typeof createExtractWorkerPool>

/** @internal */
export function createExtractWorkerPool(opts: { poolSize: number }) {
  return Pool(
    () => spawn<ExtractWorkerFunction>(new Worker("../workers/extractWorker")),
    { size: opts.poolSize }
  )
}

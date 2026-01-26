import { Pool, spawn, Worker } from "threads"
import { type ExtractWorkerFunction } from "../workers/extractWorker.js"

export type ExtractWorkerPool = ReturnType<typeof createExtractWorkerPool>

/** @internal */
export function createExtractWorkerPool(opts: { poolSize: number }) {
  return Pool(
    () =>
      spawn<ExtractWorkerFunction>(
        new Worker(
          process.env.NODE_ENV === "test"
            ? "../workers/extractWorkerWrapper.jiti.js"
            : "../workers/extractWorkerWrapper.prod.js"
        )
      ),
    {
      size: opts.poolSize,
    }
  )
}

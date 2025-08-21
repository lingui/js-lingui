import { Pool, spawn, Worker } from "threads"
import type { ExtractWorkerFunction } from "../workers/extractWorker"

export type ExtractWorkerPool = ReturnType<typeof createExtractWorkerPool>

export function createExtractWorkerPool() {
  return Pool(() =>
    spawn<ExtractWorkerFunction>(new Worker("../workers/extractWorker"))
  )
}

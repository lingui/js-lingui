import { createWorkerPool, WorkerPool } from "./typedPool.js"
import type { ExtractWorkerFunction } from "../workers/extractWorker.js"
import type { ExtractWorkerFunction as ExtractExperimentalWorkerFunction } from "../extract-experimental/workers/extractWorker.js"
import type { CompileWorkerFunction } from "../workers/compileWorker.js"

export type ExtractWorkerPool = WorkerPool<ExtractWorkerFunction>

interface PoolOptions {
  poolSize: number
}

/** @internal */
export const createExtractWorkerPool = (opts: PoolOptions): ExtractWorkerPool =>
  createWorkerPool<ExtractWorkerFunction>(
    "../workers/extractWorkerWrapper",
    import.meta.url,
    opts.poolSize,
  )

/** @internal */
export const createExtractExperimentalWorkerPool = (
  opts: PoolOptions,
): WorkerPool<ExtractExperimentalWorkerFunction> =>
  createWorkerPool<ExtractExperimentalWorkerFunction>(
    "../extract-experimental/workers/extractWorkerWrapper",
    import.meta.url,
    opts.poolSize,
  )

/** @internal */
export const createCompileWorkerPool = (
  opts: PoolOptions,
): WorkerPool<CompileWorkerFunction> =>
  createWorkerPool<CompileWorkerFunction>(
    "../workers/compileWorkerWrapper",
    import.meta.url,
    opts.poolSize,
  )

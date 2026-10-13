import {
  createNamedWorkerPool,
  createWorkerPool,
  NamedWorkerPool,
  WorkerPool,
} from "./typedPool.js"
import type { ExtractWorkerFunction } from "../workers/extractWorker.js"
import type {
  ExtractWorkerFunction as ExtractExperimentalWorkerFunction,
  WriteCatalogsWorkerFunction,
} from "../extract-experimental/workers/extractWorker.js"
import type { CompileWorkerFunction } from "../workers/compileWorker.js"
import type { MissingWorkerFunction } from "../workers/missingWorker.js"

export type ExtractWorkerPool = WorkerPool<ExtractWorkerFunction>
export type MissingWorkerPool = WorkerPool<MissingWorkerFunction>
export type ExtractExperimentalWorkerPool = NamedWorkerPool<{
  extract: ExtractExperimentalWorkerFunction
  writeCatalogs: WriteCatalogsWorkerFunction
}>

type PoolOptions = {
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
): ExtractExperimentalWorkerPool =>
  createNamedWorkerPool(
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

/** @internal */
export const createMissingWorkerPool = (opts: PoolOptions): MissingWorkerPool =>
  createWorkerPool<MissingWorkerFunction>(
    "../workers/missingWorkerWrapper",
    import.meta.url,
    opts.poolSize,
  )

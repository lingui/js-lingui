import { Tinypool, type Options } from "tinypool"

export type TypedPool<TArgs extends unknown[], TResult> = {
  run(...args: TArgs): Promise<TResult>
  destroy(): Promise<void>
}

const createTypedPool = <TArgs extends unknown[], TResult>(
  options: Options,
): TypedPool<TArgs, TResult> => {
  const pool = new Tinypool(options)

  return {
    run: (...args: TArgs) => pool.run(args) as Promise<TResult>,
    destroy: () => pool.destroy(),
  }
}

export type WorkerPool<TFn extends (...args: never[]) => unknown> = TypedPool<
  Parameters<TFn>,
  Awaited<ReturnType<TFn>>
>

const resolveWorkerFile = (basePath: string, baseUrl: string) =>
  new URL(
    new URL(baseUrl).pathname.endsWith(".ts")
      ? `${basePath}.jiti.js`
      : `${basePath}.prod.js`,
    baseUrl,
  ).href

export const createWorkerPool = <TFn extends (...args: never[]) => unknown>(
  workerBasePath: string,
  baseUrl: string,
  poolSize: number,
): WorkerPool<TFn> =>
  createTypedPool<Parameters<TFn>, Awaited<ReturnType<TFn>>>({
    filename: resolveWorkerFile(workerBasePath, baseUrl),
    minThreads: poolSize,
    maxThreads: poolSize,
  })

type WorkerFunctions = Record<string, (...args: never[]) => unknown>

/**
 * Pool over a worker module with several named exports,
 * so the same threads (and their per-worker caches) can serve different tasks
 */
export type NamedWorkerPool<TFns extends WorkerFunctions> = {
  run<TName extends keyof TFns & string>(
    name: TName,
    ...args: Parameters<TFns[TName]>
  ): Promise<Awaited<ReturnType<TFns[TName]>>>
  destroy(): Promise<void>
}

export const createNamedWorkerPool = <TFns extends WorkerFunctions>(
  workerBasePath: string,
  baseUrl: string,
  poolSize: number,
): NamedWorkerPool<TFns> => {
  const pool = new Tinypool({
    filename: resolveWorkerFile(workerBasePath, baseUrl),
    minThreads: poolSize,
    maxThreads: poolSize,
  })

  return {
    run: (name, ...args) => pool.run(args, { name }),
    destroy: () => pool.destroy(),
  }
}

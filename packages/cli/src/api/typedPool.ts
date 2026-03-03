import Tinypool, { type Options } from "tinypool"

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
    process.env.NODE_ENV === "test"
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

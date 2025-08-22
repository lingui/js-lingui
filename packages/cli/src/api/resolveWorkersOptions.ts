import os from "node:os"

export type WorkersOptions = { poolSize: number }

export function resolveWorkersOptions(opts: {
  workers?: number
}): WorkersOptions {
  const cores = os.availableParallelism()

  if (opts.workers <= 1 || cores === 1) {
    return { poolSize: 0 }
  }

  if (!opts.workers) {
    if (cores <= 2) {
      return { poolSize: cores } // on tiny machines, use all
    }
    // on big machines cap to 8, to avoid trashing
    return { poolSize: Math.min(cores - 1, 8) }
  }

  return { poolSize: opts.workers }
}

import os from "node:os"

export function resolveWorkerOptions(opts: {
  workers?: number
  noWorkers?: boolean
}): { multiThread: true; poolSize: number } | { multiThread: false } {
  const cores = os.availableParallelism()

  if (opts.noWorkers || opts.workers === 1 || cores === 1) {
    return { multiThread: false }
  }

  const multiThread = true

  if (!opts.workers) {
    if (cores <= 2) {
      return { multiThread, poolSize: cores } // on tiny machines, use all
    }
    // on big machines cap to 8, to avoid trashing
    return { multiThread, poolSize: Math.min(cores - 1, 8) }
  }

  return { multiThread, poolSize: opts.workers }
}

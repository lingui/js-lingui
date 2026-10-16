/**
 * Creates a function that runs `run` for every watcher event.
 * When `debounce` (ms) is set, rapid events are collapsed into a single run.
 */
export function createWatchDispatcher(options: {
  debounce?: number
  run: () => unknown
}) {
  let debounceTimer: NodeJS.Timeout | undefined

  return () => {
    // Skip debouncing if not enabled
    if (!options.debounce) {
      options.run()
      return
    }

    // Clear the previous timer if there is any, and schedule the next
    debounceTimer && clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => options.run(), options.debounce)
  }
}

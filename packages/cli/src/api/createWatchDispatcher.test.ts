import { createWatchDispatcher } from "./createWatchDispatcher.js"

describe("createWatchDispatcher", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("should run exactly once per event when debounce is not set", () => {
    const run = vi.fn()
    const dispatch = createWatchDispatcher({ run })

    dispatch()
    expect(run).toHaveBeenCalledTimes(1)

    vi.runAllTimers()
    expect(run).toHaveBeenCalledTimes(1)
  })

  it("should collapse rapid events into a single run when debounce is set", () => {
    const run = vi.fn()
    const dispatch = createWatchDispatcher({ debounce: 50, run })

    dispatch()
    dispatch()
    dispatch()
    expect(run).not.toHaveBeenCalled()

    vi.advanceTimersByTime(49)
    expect(run).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(run).toHaveBeenCalledTimes(1)

    vi.runAllTimers()
    expect(run).toHaveBeenCalledTimes(1)
  })
})

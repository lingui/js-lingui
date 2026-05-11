import { WorkerLogger } from "./workerLogger.js"

describe("WorkerLogger", () => {
  it("error joins args with space", () => {
    const logger = new WorkerLogger()
    logger.error("a", "b", "c")
    expect(logger.flush().errors).toBe("a b c")
  })

  it("flush clears errors after returning them", () => {
    const logger = new WorkerLogger()
    logger.error("first")
    const first = logger.flush()
    expect(first.errors).toBe("first")
    expect(logger.flush().errors).toBe("")
  })

  it("multiple errors joined by newline", () => {
    const logger = new WorkerLogger()
    logger.error("line1")
    logger.error("line2")
    expect(logger.flush().errors).toBe("line1\nline2")
  })

  it("warn/info/verbose are no-ops", () => {
    const logger = new WorkerLogger()
    logger.warn("ignored")
    logger.info("ignored")
    logger.verbose("ignored")
    expect(logger.flush().errors).toBe("")
  })
})

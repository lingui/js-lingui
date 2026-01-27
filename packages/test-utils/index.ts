import { vi, Mocked, MockInstance } from "vitest"

export function getConsoleMockCalls({ mock }: MockInstance) {
  if (!mock.calls.length) return
  return mock.calls.map((call) => call[0]).join("\n")
}

export function mockConsole<T>(testCase: (console: Mocked<Console>) => T): T {
  function restoreConsole() {
    global.console = originalConsole
  }
  const originalConsole = global.console

  global.console = {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  } as any

  let result: any
  try {
    result = testCase(global.console as Mocked<Console>)
  } catch (e) {
    restoreConsole()
    throw e
  }

  if (result && typeof result.then === "function") {
    return result
      .then((r: T) => {
        restoreConsole()
        return r
      })
      .catch((e: unknown) => {
        restoreConsole()
        throw e
      })
  } else {
    restoreConsole()
    return result
  }
}

export function mockEnv(env: string, testCase: () => void) {
  const oldEnv = process.env.NODE_ENV
  process.env.NODE_ENV = env

  try {
    testCase()
  } catch (e) {
    process.env.NODE_ENV = oldEnv
    throw e
  }

  process.env.NODE_ENV = oldEnv
}

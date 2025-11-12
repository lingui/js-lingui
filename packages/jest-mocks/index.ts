import { vi, Mocked, MockInstance } from "vitest"

export function getConsoleMockCalls({ mock }: MockInstance) {
  if (!mock.calls.length) return
  return mock.calls.map((call) => call[0]).join("\n")
}

export function mockConsole<T>(
  testCase: (console: Mocked<Console>) => T,
  mock = {}
): T {
  function restoreConsole() {
    global.console = originalConsole
  }

  const originalConsole = global.console

  const defaults = {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }

  global.console = {
    ...defaults,
    ...mock,
  } as any

  let result
  try {
    result = testCase(global.console as Mocked<Console>)
  } catch (e) {
    restoreConsole()
    throw e
  }

  if (result && typeof result.then === "function") {
    return result.then(restoreConsole).catch((e) => {
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

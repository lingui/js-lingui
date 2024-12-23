import { vi, MockInstance, Mocked } from "vitest"

export function getConsoleMockCalls({ mock }: MockInstance<any>) {
  if (!mock.calls.length) return
  return mock.calls.map((call) => call[0]).join("\n")
}

export function mockConsole(
  testCase: (console: Mocked<Console>) => any,
  mock = {}
) {
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

export function mockEnv(env, testCase) {
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

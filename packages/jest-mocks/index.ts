import { defaultConfig, LinguiConfig } from "@lingui/conf"

export function mockConfig(config: Partial<LinguiConfig> = {}) {
  return {
    ...defaultConfig,
    ...config,
  }
}

export function getConsoleMockCalls({ mock }) {
  if (!mock.calls.length) return
  return mock.calls.map((call) => call[0]).join("\n")
}

export function mockConsole(testCase: (console: jest.Mocked<Console>) => any, mock = {}) {
  function restoreConsole() {
    global.console = originalConsole
  }

  const originalConsole = global.console

  const defaults = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }

  global.console = {
    ...defaults,
    ...mock,
  } as any

  let result
  try {
    result = testCase(global.console as jest.Mocked<Console>)
  } catch (e) {
    restoreConsole()
    throw e
  }

  if (result && typeof result.then === "function") {
    return result.then(restoreConsole).catch(restoreConsole)
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

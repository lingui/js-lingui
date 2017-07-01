export function mockConsole (testCase, mock = {}) {
  const originalConsole = global.console

  const defaults = {
    log: jest.fn(),
    warn: jest.fn()
  }

  global.console = {
    ...defaults,
    ...mock
  }

  try {
    testCase(global.console)
  } catch (e) {
    global.console = originalConsole
    throw e
  }

  global.console = originalConsole
}

export function mockEnv (env, testCase) {
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

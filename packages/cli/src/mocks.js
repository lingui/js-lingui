export function mockConsole(testCase, mock = {}) {
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

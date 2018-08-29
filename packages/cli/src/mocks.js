// @flow
import { defaultConfig } from "@lingui/conf"
import type { LinguiConfig } from "./api/types"

export function mockConfig(config?: Object = {}): LinguiConfig {
  return {
    ...defaultConfig,
    ...config
  }
}

export function mockConsole(testCase: Function, mock: Object = {}) {
  function restoreConsole() {
    global.console = originalConsole
  }

  const originalConsole = global.console

  const defaults = {
    log: jest.fn(),
    warn: jest.fn()
  }

  global.console = {
    ...defaults,
    ...mock
  }

  let result
  try {
    result = testCase(global.console)
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

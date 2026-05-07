export const LOG_LEVELS = [
  "silent",
  "error",
  "warning",
  "info",
  "verbose",
] as const

export type LogLevel = (typeof LOG_LEVELS)[number]

export type Logger = {
  error: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  verbose: (...args: unknown[]) => void
}

function isAtLeast(current: LogLevel, minimum: LogLevel): boolean {
  return LOG_LEVELS.indexOf(current) >= LOG_LEVELS.indexOf(minimum)
}

const noop = () => {}

export function initLogger(logLevel: LogLevel): Logger {
  return {
    error: isAtLeast(logLevel, "error")
      ? (...args) => console.error(...args)
      : noop,
    warn: isAtLeast(logLevel, "warning")
      ? (...args) => console.warn(...args)
      : noop,
    info: isAtLeast(logLevel, "info")
      ? (...args) => console.log(...args)
      : noop,
    verbose: isAtLeast(logLevel, "verbose")
      ? (...args) => console.log(...args)
      : noop,
  }
}

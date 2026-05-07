import { Logger } from "./logger.js"

export type SerializedLogs = {
  errors: string
}

export class WorkerLogger implements Logger {
  private errors: string[] = []

  error(...args: unknown[]): void {
    this.errors.push(args.join(" "))
  }

  warn(): void {}
  info(): void {}
  verbose(): void {}

  flush(): SerializedLogs {
    const errors = this.errors.join("\n")
    this.errors = []

    return {
      errors,
    }
  }
}

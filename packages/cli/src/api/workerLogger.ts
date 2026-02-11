import { Logger } from "./logger.js"

export type SerializedLogs = {
  errors: string
}

export class WorkerLogger implements Logger {
  private errors: string[] = []

  error(msg: string): void {
    this.errors.push(msg)
  }

  flush(): SerializedLogs {
    const errors = this.errors.join("\n")
    this.errors = []

    return {
      errors,
    }
  }
}

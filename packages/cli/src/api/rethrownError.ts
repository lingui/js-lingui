export class RethrownError extends Error {
  public message: string

  constructor(message: string, originalError: Error) {
    super()

    this.message = message + " " + originalError.message
    this.stack = `Error: ${message} \nOriginal: ` + originalError.stack
  }
}

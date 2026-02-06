export class ProgramExit extends Error {
  constructor() {
    super()

    this.name = "ProgramExit"
  }
}

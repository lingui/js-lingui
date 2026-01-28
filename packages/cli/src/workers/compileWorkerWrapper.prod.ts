import { compileWorker } from "./compileWorker.js"

export default (args: Parameters<typeof compileWorker>) =>
  compileWorker(...args)

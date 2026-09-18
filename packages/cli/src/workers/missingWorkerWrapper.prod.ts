import { missingWorker } from "./missingWorker.js"

export default (args: Parameters<typeof missingWorker>) =>
  missingWorker(...args)

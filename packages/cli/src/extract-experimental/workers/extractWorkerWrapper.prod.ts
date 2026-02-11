import { extractWorker } from "./extractWorker.js"

export default (args: Parameters<typeof extractWorker>) =>
  extractWorker(...args)

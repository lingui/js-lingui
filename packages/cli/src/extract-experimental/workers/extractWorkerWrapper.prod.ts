import { extractWorker, writeCatalogsWorker } from "./extractWorker.js"

export const extract = (args: Parameters<typeof extractWorker>) =>
  extractWorker(...args)

export const writeCatalogs = (args: Parameters<typeof writeCatalogsWorker>) =>
  writeCatalogsWorker(...args)

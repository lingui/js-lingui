import { createJiti } from "jiti"
const jiti = createJiti(import.meta.url)

/**
 * @type {typeof import("./extractWorker")}
 */
const mod = await jiti.import("./extractWorker")

/** @param {Parameters<typeof mod.extractWorker>} args */
export const extract = (args) => mod.extractWorker(...args)

/** @param {Parameters<typeof mod.writeCatalogsWorker>} args */
export const writeCatalogs = (args) => mod.writeCatalogsWorker(...args)

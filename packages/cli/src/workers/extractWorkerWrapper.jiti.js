import { createJiti } from "jiti"
const jiti = createJiti(import.meta.url)

/**
 * @type {typeof import("./extractWorker")}
 */
const mod = await jiti.import("./extractWorker")

/** @param {Parameters<typeof mod.extractWorker>} args */
export default (args) => mod.extractWorker(...args)

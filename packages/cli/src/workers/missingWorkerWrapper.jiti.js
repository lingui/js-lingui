import { createJiti } from "jiti"
const jiti = createJiti(import.meta.url)

/**
 * @type {typeof import("./missingWorker")}
 */
const mod = await jiti.import("./missingWorker")

/** @param {Parameters<typeof mod.missingWorker>} args */
export default (args) => mod.missingWorker(...args)

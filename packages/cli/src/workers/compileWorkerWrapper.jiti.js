import { createJiti } from "jiti"
const jiti = createJiti(import.meta.url)

/**
 * @type {typeof import("./compileWorker")}
 */
const mod = await jiti.import("./compileWorker")

/** @param {Parameters<typeof mod.compileWorker>} args */
export default (args) => mod.compileWorker(...args)

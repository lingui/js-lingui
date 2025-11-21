import { expose } from "threads/worker"
import { createJiti } from "jiti"
const jiti = createJiti(import.meta.url)

/**
 * @type {typeof import("./compileWorker")}
 */
const mod = await jiti.import("./compileWorker")

expose(mod.compileWorker)

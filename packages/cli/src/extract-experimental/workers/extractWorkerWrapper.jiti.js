import { expose } from "threads/worker"

import { createJiti } from "jiti"
const jiti = createJiti(import.meta.url)

/**
 * @type {typeof import("./extractWorker")}
 */
const mod = await jiti.import("./extractWorker")

expose(mod.extractWorker)

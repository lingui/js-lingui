import { expose } from "threads/worker"
import { compileWorker } from "./compileWorker.js"

expose(compileWorker)

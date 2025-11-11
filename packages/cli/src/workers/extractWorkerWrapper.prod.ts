import { expose } from "threads/worker"
import { extractWorker } from "./extractWorker.js"

expose(extractWorker)

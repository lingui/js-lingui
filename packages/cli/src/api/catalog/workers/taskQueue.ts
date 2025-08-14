import { Worker } from "worker_threads"
import { cpus } from "os"

export interface WorkerTask<T, R> {
  id: string
  data: T
  resolve: (result: R) => void
  reject: (error: Error) => void
}

export class WorkerPool<T, R> {
  private workers: Worker[] = []
  private taskQueue: WorkerTask<T, R>[] = []
  private busyWorkers = new Set<Worker>()
  private readonly workerScript: string
  private readonly maxWorkers: number

  constructor(workerScript: string, maxWorkers?: number) {
    this.workerScript = workerScript
    this.maxWorkers = maxWorkers || cpus().length
  }

  async execute(taskId: string, data: T): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      const task: WorkerTask<T, R> = {
        id: taskId,
        data,
        resolve,
        reject
      }

      this.taskQueue.push(task)
      this.processQueue()
    })
  }

  private processQueue() {
    if (this.taskQueue.length === 0) {
      return
    }

    const availableWorker = this.getAvailableWorker()
    if (availableWorker) {
      const task = this.taskQueue.shift()!
      this.executeTask(availableWorker, task)
    }
  }

  private getAvailableWorker(): Worker | null {
    // Find an idle worker
    for (const worker of this.workers) {
      if (!this.busyWorkers.has(worker)) {
        return worker
      }
    }

    // Create new worker if we haven't reached the limit
    if (this.workers.length < this.maxWorkers) {
      const worker = this.createWorker()
      this.workers.push(worker)
      return worker
    }

    return null
  }

  private createWorker(): Worker {
    const worker = new Worker(this.workerScript)
    
    worker.on("error", (error) => {
      // Handle worker errors
      console.error("Worker error:", error)
      this.busyWorkers.delete(worker)
      this.removeWorker(worker)
      this.processQueue() // Try to process remaining tasks
    })

    worker.on("exit", (code) => {
      this.busyWorkers.delete(worker)
      this.removeWorker(worker)
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`)
      }
    })

    return worker
  }

  private executeTask(worker: Worker, task: WorkerTask<T, R>) {
    this.busyWorkers.add(worker)

    const messageHandler = (result: R) => {
      worker.off("message", messageHandler)
      this.busyWorkers.delete(worker)

      // Check if result indicates an error
      if (result && typeof result === "object" && "error" in result && "success" in result) {
        const errorResult = result as any
        if (!errorResult.success && errorResult.error) {
          task.reject(new Error(errorResult.error))
          this.processQueue()
          return
        }
      }

      task.resolve(result)
      this.processQueue()
    }

    worker.on("message", messageHandler)
    worker.postMessage(task.data)
  }

  private removeWorker(worker: Worker) {
    const index = this.workers.indexOf(worker)
    if (index > -1) {
      this.workers.splice(index, 1)
    }
  }

  async close(): Promise<void> {
    const terminationPromises = this.workers.map(worker => worker.terminate())
    await Promise.all(terminationPromises)
    this.workers = []
    this.busyWorkers.clear()
    this.taskQueue = []
  }

  getStats() {
    return {
      totalWorkers: this.workers.length,
      busyWorkers: this.busyWorkers.size,
      queuedTasks: this.taskQueue.length,
      maxWorkers: this.maxWorkers
    }
  }
}

export class TaskQueue<T, R> {
  private tasks: Array<() => Promise<R>> = []
  private results: R[] = []
  private useWorkers: boolean
  private workerPool?: WorkerPool<T, R>

  constructor(useWorkers: boolean = false, workerScript?: string, maxWorkers?: number) {
    this.useWorkers = useWorkers
    if (useWorkers && workerScript) {
      this.workerPool = new WorkerPool<T, R>(workerScript, maxWorkers)
    }
  }

  addTask(taskFn: () => Promise<R>): void
  addTask(taskId: string, data: T): void
  addTask(taskFnOrId: (() => Promise<R>) | string, data?: T): void {
    if (typeof taskFnOrId === "function") {
      this.tasks.push(taskFnOrId)
    } else if (this.workerPool && data !== undefined) {
      this.tasks.push(() => this.workerPool!.execute(taskFnOrId, data))
    } else {
      throw new Error("Invalid task parameters")
    }
  }

  async executeAll(): Promise<R[]> {
    if (this.useWorkers && this.workerPool) {
      // Execute all tasks using worker pool
      this.results = await Promise.all(this.tasks.map(task => task()))
      await this.workerPool.close()
    } else {
      // Execute tasks sequentially (original behavior)
      this.results = []
      for (const task of this.tasks) {
        const result = await task()
        this.results.push(result)
      }
    }

    return this.results
  }

  getResults(): R[] {
    return this.results
  }

  clear(): void {
    this.tasks = []
    this.results = []
  }
}
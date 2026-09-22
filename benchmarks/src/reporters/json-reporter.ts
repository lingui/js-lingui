import fs from "fs"
import path from "path"
import type { Bench } from "tinybench"
import type { PresetConfig } from "../presets.js"

interface ScenarioResult {
  scenario: string
  tasks: TaskResult[]
}

interface TaskResult {
  name: string
  meanMs: number
  stdDevMs: number
  minMs: number
  maxMs: number
  iterations: number
  throughput?: number
  throughputUnit?: string
}

interface BenchmarkOutput {
  metadata: {
    timestamp: string
    nodeVersion: string
    platform: string
    arch: string
  }
  preset: {
    name: string
    files: number
    messagesPerFile: number
    totalMessages: number
    locales: string[]
  }
  results: ScenarioResult[]
}

function extractTaskResults(
  bench: Bench,
  throughputDivisor?: number,
  throughputUnit?: string,
): TaskResult[] {
  return bench.tasks
    .filter((t) => t.result)
    .map((task) => {
      const r = task.result!
      const result: TaskResult = {
        name: task.name,
        meanMs: r.mean,
        stdDevMs: Math.sqrt(r.variance),
        minMs: r.min,
        maxMs: r.max,
        iterations: r.samples.length,
      }
      if (throughputDivisor) {
        result.throughput = throughputDivisor / (r.mean / 1000)
        result.throughputUnit = throughputUnit
      }
      return result
    })
}

export function writeJsonResults(
  resultsDir: string,
  preset: PresetConfig,
  scenarios: {
    name: string
    bench: Bench
    throughputDivisor?: number
    throughputUnit?: string
  }[],
) {
  fs.mkdirSync(resultsDir, { recursive: true })

  const output: BenchmarkOutput = {
    metadata: {
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    preset: {
      name: preset.name,
      files: preset.files,
      messagesPerFile: preset.messagesPerFile,
      totalMessages: preset.files * preset.messagesPerFile,
      locales: preset.locales,
    },
    results: scenarios.map((s) => ({
      scenario: s.name,
      tasks: extractTaskResults(s.bench, s.throughputDivisor, s.throughputUnit),
    })),
  }

  const filepath = path.join(resultsDir, "results.json")
  fs.writeFileSync(filepath, JSON.stringify(output, null, 2))
  console.log(`\nResults written to: ${filepath}`)
}

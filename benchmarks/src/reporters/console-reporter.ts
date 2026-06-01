import Table from "cli-table3"
import type { Bench } from "tinybench"
import type { PresetConfig } from "../presets.js"

function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`
  return `${ms.toFixed(0)}ms`
}

function formatThroughput(value: number, unit: string): string {
  return `${Math.round(value)} ${unit}`
}

export function printHeader(preset: PresetConfig) {
  const totalMsgs = preset.files * preset.messagesPerFile
  console.log("")
  console.log("══════════════════════════════════════════════════════════════")
  console.log(`  Lingui Benchmark — Preset: ${preset.name}`)
  console.log(
    `  ${preset.files} files · ${totalMsgs} messages · ${preset.locales.length} locales`,
  )
  console.log(`  Node ${process.version} · ${process.platform} ${process.arch}`)
  console.log("══════════════════════════════════════════════════════════════")
}

export function printScenario(
  title: string,
  bench: Bench,
  throughputUnit: string,
  throughputDivisor: number,
) {
  console.log("")
  console.log(`─── ${title} ───`)
  console.log("")

  const table = new Table({
    head: ["Configuration", "Mean", "± StdDev", `${throughputUnit}`],
    style: { head: ["cyan"] },
  })

  const tasks = bench.tasks
  let baselineMean: number | null = null

  for (const task of tasks) {
    if (!task.result) continue
    const mean = task.result.mean
    const stdDev = Math.sqrt(task.result.variance)

    if (baselineMean === null) baselineMean = mean

    const throughput = throughputDivisor / (mean / 1000)
    table.push([
      task.name,
      formatMs(mean),
      `±${formatMs(stdDev)}`,
      formatThroughput(throughput, ""),
    ])
  }

  console.log(table.toString())
}

export function printMacroScenario(
  title: string,
  bench: Bench,
  fileCount: number,
) {
  console.log("")
  console.log(`─── ${title} ───`)
  console.log("")

  const table = new Table({
    head: ["Engine", "Mean", "± StdDev", "Files/s", "vs Babel"],
    style: { head: ["cyan"] },
  })

  const tasks = bench.tasks
  let babelMean: number | null = null

  for (const task of tasks) {
    if (!task.result) continue
    const mean = task.result.mean
    const stdDev = Math.sqrt(task.result.variance)

    if (babelMean === null) babelMean = mean

    const filesPerSec = fileCount / (mean / 1000)
    const speedup = babelMean / mean

    table.push([
      task.name,
      formatMs(mean),
      `±${formatMs(stdDev)}`,
      formatThroughput(filesPerSec, ""),
      `${speedup.toFixed(1)}x`,
    ])
  }

  console.log(table.toString())
}

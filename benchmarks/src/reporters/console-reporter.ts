import type { Bench } from "tinybench"
import type { PresetConfig } from "../presets.js"

const BAR_WIDTH = 25

function formatTime(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`
  return `${ms.toFixed(0)}ms`
}

function formatThroughput(value: number, unit: string): string {
  if (value >= 10000) return `${(value / 1000).toFixed(1)}k ${unit}`
  return `${Math.round(value)} ${unit}`
}

function makeBar(ratio: number): string {
  const filled = Math.max(1, Math.round(ratio * BAR_WIDTH))
  const empty = BAR_WIDTH - filled
  return "█".repeat(filled) + "░".repeat(empty)
}

function formatRme(rme: number): string {
  if (rme > 5) return ` ±${rme.toFixed(1)}%`
  return ""
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

export interface ScenarioOpts {
  throughputUnit: string
  throughputDivisor: number
}

export function printScenario(title: string, bench: Bench, opts: ScenarioOpts) {
  const tasks = bench.tasks.filter((t) => t.result)
  if (tasks.length === 0) return

  console.log("")
  console.log(`  ${title}:`)

  const results = tasks.map((task) => {
    const r = task.result!
    const throughput = opts.throughputDivisor / (r.mean / 1000)
    return { name: task.name, mean: r.mean, rme: r.rme, throughput }
  })

  const maxMean = Math.max(...results.map((r) => r.mean))
  const fastest = results.reduce((a, b) => (a.mean < b.mean ? a : b))

  const nameWidth = Math.max(...results.map((r) => r.name.length))
  const timeWidth = Math.max(...results.map((r) => formatTime(r.mean).length))

  for (const r of results) {
    const ratio = r.mean / maxMean
    const bar = makeBar(ratio)
    const isFastest = r === fastest
    const marker = isFastest ? " ⚡" : ""
    const rme = formatRme(r.rme)
    const name = r.name.padEnd(nameWidth)
    const time = formatTime(r.mean).padStart(timeWidth)
    const tp = formatThroughput(r.throughput, opts.throughputUnit)
    console.log(`    ${name}  ${bar}  ${time}  ${tp}${rme}${marker}`)
  }

  // Summary: comparison vs fastest
  if (results.length > 1) {
    console.log("")
    console.log(`  Summary:`)
    for (const r of results) {
      if (r === fastest) continue
      const ratio = r.mean / fastest.mean
      console.log(
        `    ${fastest.name} is ${ratio.toFixed(1)}x faster than ${r.name}`,
      )
    }
  }
}

import path from "path"
import fs from "fs"
import { parseArgs } from "node:util"
import { fileURLToPath } from "node:url"
import type { PresetConfig } from "./presets.js"
import { runExtractBenchmark } from "./scenarios/extract.bench.js"
import { runExtractTemplateBenchmark } from "./scenarios/extract-template.bench.js"
import { runCompileBenchmark } from "./scenarios/compile.bench.js"
import { runMacroTransformBenchmark } from "./scenarios/macro-transform.bench.js"
import { printHeader, printScenario } from "./reporters/console-reporter.js"
import { writeJsonResults } from "./reporters/json-reporter.js"

const FIXTURES_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".fixtures",
)

const { values } = parseArgs({
  options: {
    scenario: { type: "string" },
  },
  strict: false,
})

async function main() {
  const presetPath = path.join(FIXTURES_DIR, "preset.json")

  if (!fs.existsSync(presetPath)) {
    console.error(
      `Fixtures not found at ${FIXTURES_DIR}.\nRun \`yarn workspace @lingui/benchmarks generate\` first.`,
    )
    process.exit(1)
  }

  const preset: PresetConfig = JSON.parse(fs.readFileSync(presetPath, "utf-8"))
  const resultsDir = path.resolve(FIXTURES_DIR, "..", ".results")

  const selectedScenario = values.scenario ? String(values.scenario) : undefined
  const scenarios: {
    name: string
    bench: any
    throughputDivisor: number
    throughputUnit: string
  }[] = []

  printHeader(preset)

  if (!selectedScenario || selectedScenario === "extract") {
    console.log("\nRunning: Extract (full pipeline)...")
    const bench = await runExtractBenchmark(FIXTURES_DIR, preset)
    const opts = { throughputUnit: "files/s", throughputDivisor: preset.files }
    printScenario("Extract (scan → extract → merge → write)", bench, opts)
    scenarios.push({ name: "extract", bench, ...opts })
  }

  if (!selectedScenario || selectedScenario === "extract-template") {
    console.log("\nRunning: Extract Template (no merge)...")
    const bench = await runExtractTemplateBenchmark(FIXTURES_DIR, preset)
    const opts = { throughputUnit: "files/s", throughputDivisor: preset.files }
    printScenario(
      "Extract Template (scan → extract → write, no merge)",
      bench,
      opts,
    )
    scenarios.push({ name: "extract-template", bench, ...opts })
  }

  if (!selectedScenario || selectedScenario === "compile") {
    console.log("\nRunning: Compile...")
    const bench = await runCompileBenchmark(FIXTURES_DIR, preset)
    const totalMsgs =
      preset.files * preset.messagesPerFile * preset.locales.length
    const opts = { throughputUnit: "msgs/s", throughputDivisor: totalMsgs }
    printScenario("Compile (read PO → compile ICU → write JS)", bench, opts)
    scenarios.push({ name: "compile", bench, ...opts })
  }

  if (!selectedScenario || selectedScenario === "macro-transform") {
    console.log("\nRunning: Pure Macro Transform...")
    const bench = await runMacroTransformBenchmark(FIXTURES_DIR, preset)
    const opts = { throughputUnit: "files/s", throughputDivisor: preset.files }
    printScenario("Pure Macro Transform (no I/O, no catalogs)", bench, opts)
    scenarios.push({ name: "macro-transform", bench, ...opts })
  }

  writeJsonResults(resultsDir, preset, scenarios)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

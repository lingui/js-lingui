import path from "path"
import fs from "fs"
import { parseArgs } from "node:util"
import { PRESETS, type PresetConfig } from "./presets.js"
import { generateJsxFile } from "./generators/jsx-file-generator.js"
import { generateJsFile } from "./generators/js-file-generator.js"
import { generatePoCatalogs } from "./generators/po-catalog-generator.js"
import { runExtractBenchmark } from "./scenarios/extract.bench.js"
import { runExtractTemplateBenchmark } from "./scenarios/extract-template.bench.js"
import { runCompileBenchmark } from "./scenarios/compile.bench.js"
import { runMacroTransformBenchmark } from "./scenarios/macro-transform.bench.js"
import { printHeader, printScenario } from "./reporters/console-reporter.js"
import { writeJsonResults } from "./reporters/json-reporter.js"

const { values } = parseArgs({
  options: {
    preset: { type: "string", default: "medium" },
    files: { type: "string" },
    "messages-per-file": { type: "string" },
    locales: { type: "string" },
    scenario: { type: "string" },
    "skip-generate": { type: "boolean", default: false },
  },
  strict: false,
})

function resolvePreset(): PresetConfig {
  const presetName = String(values.preset || "medium")
  const base = PRESETS[presetName]!
  return {
    ...base,
    files: values.files ? Number(values.files) : base.files,
    messagesPerFile: values["messages-per-file"]
      ? Number(values["messages-per-file"])
      : base.messagesPerFile,
    locales: values.locales ? String(values.locales).split(",") : base.locales,
  }
}

async function generateFixtures(fixturesDir: string, preset: PresetConfig) {
  if (fs.existsSync(fixturesDir)) {
    fs.rmSync(fixturesDir, { recursive: true })
  }

  const componentsDir = path.join(fixturesDir, "src", "components")
  const utilsDir = path.join(fixturesDir, "src", "utils")
  fs.mkdirSync(componentsDir, { recursive: true })
  fs.mkdirSync(utilsDir, { recursive: true })

  const jsxCount = Math.ceil(preset.files / 2)
  const jsCount = preset.files - jsxCount

  console.log(
    `Generating fixtures: ${preset.files} files, ${preset.messagesPerFile} msgs/file, ${preset.locales.length} locales`,
  )
  const startTime = Date.now()

  for (let i = 0; i < jsxCount; i++) {
    const content = generateJsxFile(i, preset.messagesPerFile)
    const padded = String(i).padStart(4, "0")
    fs.writeFileSync(
      path.join(componentsDir, `Component${padded}.tsx`),
      content,
    )
  }

  for (let i = 0; i < jsCount; i++) {
    const fileIndex = jsxCount + i
    const content = generateJsFile(fileIndex, preset.messagesPerFile)
    const padded = String(fileIndex).padStart(4, "0")
    fs.writeFileSync(path.join(utilsDir, `util${padded}.ts`), content)
  }

  await generatePoCatalogs(fixturesDir, preset)
  console.log(`Fixtures generated in ${Date.now() - startTime}ms`)
}

async function main() {
  const preset = resolvePreset()
  const benchDir = path.dirname(new URL(import.meta.url).pathname)
  const fixturesDir = path.resolve(benchDir, "..", ".fixtures", preset.name)
  const resultsDir = path.resolve(benchDir, "..", ".results")

  if (!values["skip-generate"]) {
    await generateFixtures(fixturesDir, preset)
  } else if (!fs.existsSync(fixturesDir)) {
    console.error(
      `Fixtures not found at ${fixturesDir}. Run without --skip-generate first.`,
    )
    process.exit(1)
  }

  const selectedScenario = values.scenario
  const scenarios: {
    name: string
    bench: any
    throughputDivisor: number
    throughputUnit: string
  }[] = []

  printHeader(preset)

  if (!selectedScenario || selectedScenario === "extract") {
    console.log("\nRunning: Extract (full pipeline)...")
    const bench = await runExtractBenchmark(fixturesDir, preset)
    const opts = { throughputUnit: "files/s", throughputDivisor: preset.files }
    printScenario("Extract (scan → extract → merge → write)", bench, opts)
    scenarios.push({ name: "extract", bench, ...opts })
  }

  if (!selectedScenario || selectedScenario === "extract-template") {
    console.log("\nRunning: Extract Template (no merge)...")
    const bench = await runExtractTemplateBenchmark(fixturesDir, preset)
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
    const bench = await runCompileBenchmark(fixturesDir, preset)
    const totalMsgs =
      preset.files * preset.messagesPerFile * preset.locales.length
    const opts = { throughputUnit: "msgs/s", throughputDivisor: totalMsgs }
    printScenario("Compile (read PO → compile ICU → write JS)", bench, opts)
    scenarios.push({ name: "compile", bench, ...opts })
  }

  if (!selectedScenario || selectedScenario === "macro-transform") {
    console.log("\nRunning: Pure Macro Transform...")
    const bench = await runMacroTransformBenchmark(fixturesDir, preset)
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

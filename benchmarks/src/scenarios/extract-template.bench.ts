import { Bench } from "tinybench"
import type { PresetConfig } from "../presets.js"
import { writeConfigs } from "../utils/config-builder.js"
import { runLingui } from "../utils/run-cli.js"

export async function runExtractTemplateBenchmark(
  fixturesDir: string,
  preset: PresetConfig,
) {
  const configs = writeConfigs(fixturesDir, preset)

  const bench = new Bench({ warmupIterations: 1, iterations: 3, throws: true })

  bench.add("Babel · 1 worker", () => {
    runLingui(["extract-template", "--workers", "1"], configs.babel)
  })

  bench.add("Babel · 2 workers", () => {
    runLingui(["extract-template", "--workers", "2"], configs.babel)
  })

  bench.add("SWC · 1 worker", () => {
    runLingui(["extract-template", "--workers", "1"], configs.swc)
  })

  bench.add("SWC · 2 workers", () => {
    runLingui(["extract-template", "--workers", "2"], configs.swc)
  })

  await bench.run()
  return bench
}

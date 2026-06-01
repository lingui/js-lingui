import { Bench } from "tinybench"
import type { PresetConfig } from "../presets.js"
import { writeConfigs } from "../utils/config-builder.js"
import { runLingui } from "../utils/run-cli.js"

export async function runExtractBenchmark(
  fixturesDir: string,
  preset: PresetConfig,
) {
  const configs = writeConfigs(fixturesDir, preset)

  const bench = new Bench({ warmupIterations: 1, iterations: 3, throws: true })

  bench.add("Babel · 1 worker", () => {
    runLingui(["extract", "--workers", "1"], configs.babel)
  })

  bench.add("Babel · 2 workers", () => {
    runLingui(["extract", "--workers", "2"], configs.babel)
  })

  bench.add("SWC · 1 worker", () => {
    runLingui(["extract", "--workers", "1"], configs.swc)
  })

  bench.add("SWC · 2 workers", () => {
    runLingui(["extract", "--workers", "2"], configs.swc)
  })

  await bench.run()
  return bench
}

import { Bench } from "tinybench"
import type { PresetConfig } from "../presets.js"
import { writeConfigs } from "../utils/config-builder.js"
import { runLingui } from "../utils/run-cli.js"

export async function runCompileBenchmark(
  fixturesDir: string,
  preset: PresetConfig,
) {
  const configs = writeConfigs(fixturesDir, preset)

  const bench = new Bench({ warmupIterations: 1, iterations: 5, throws: true })

  bench.add("1 worker", () => {
    runLingui(["compile", "--workers", "1"], configs.babel)
  })

  bench.add("2 workers", () => {
    runLingui(["compile", "--workers", "2"], configs.babel)
  })

  await bench.run()
  return bench
}

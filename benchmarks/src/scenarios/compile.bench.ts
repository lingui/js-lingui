import { Bench } from "tinybench"
import type { PresetConfig } from "../presets.js"
import { buildConfig } from "../utils/config-builder.js"
import { silenceConsole } from "../utils/silence.js"

export async function runCompileBenchmark(
  fixturesDir: string,
  preset: PresetConfig,
) {
  const { command: compileCommand } =
    await import("@lingui/cli/commands/compile")

  const config = buildConfig(fixturesDir, preset, false)

  const bench = new Bench({ warmupIterations: 1, iterations: 5 })

  bench.add("1 worker", async () => {
    const restore = silenceConsole()
    try {
      await compileCommand(config, {
        verbose: false,
        allowEmpty: true,
        failOnCompileError: false,
        workersOptions: { poolSize: 0 },
        namespace: "es",
      })
    } finally {
      restore()
    }
  })

  bench.add("2 workers", async () => {
    const restore = silenceConsole()
    try {
      await compileCommand(config, {
        verbose: false,
        allowEmpty: true,
        failOnCompileError: false,
        workersOptions: { poolSize: 2 },
        namespace: "es",
      })
    } finally {
      restore()
    }
  })

  await bench.run()
  return bench
}

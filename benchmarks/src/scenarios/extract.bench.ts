import { Bench } from "tinybench"
import type { PresetConfig } from "../presets.js"
import { buildConfig } from "../utils/config-builder.js"
import { silenceConsole } from "../utils/silence.js"

export async function runExtractBenchmark(
  fixturesDir: string,
  preset: PresetConfig,
) {
  const { default: extractCommand } =
    await import("@lingui/cli/commands/extract")

  const babelConfig = buildConfig(fixturesDir, preset, false)
  const swcConfig = buildConfig(fixturesDir, preset, true)

  const bench = new Bench({ warmup: 1, iterations: 3 })

  bench.add("Babel · 1 worker", async () => {
    const restore = silenceConsole()
    try {
      await extractCommand(babelConfig, {
        verbose: false,
        clean: false,
        overwrite: false,
        workersOptions: { poolSize: 0 },
      })
    } finally {
      restore()
    }
  })

  bench.add("Babel · 2 workers", async () => {
    const restore = silenceConsole()
    try {
      await extractCommand(babelConfig, {
        verbose: false,
        clean: false,
        overwrite: false,
        workersOptions: { poolSize: 2 },
      })
    } finally {
      restore()
    }
  })

  bench.add("SWC · 1 worker", async () => {
    const restore = silenceConsole()
    try {
      await extractCommand(swcConfig, {
        verbose: false,
        clean: false,
        overwrite: false,
        workersOptions: { poolSize: 0 },
      })
    } finally {
      restore()
    }
  })

  bench.add("SWC · 2 workers", async () => {
    const restore = silenceConsole()
    try {
      await extractCommand(swcConfig, {
        verbose: false,
        clean: false,
        overwrite: false,
        workersOptions: { poolSize: 2 },
      })
    } finally {
      restore()
    }
  })

  await bench.run()
  return bench
}

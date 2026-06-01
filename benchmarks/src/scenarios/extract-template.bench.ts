import { Bench } from "tinybench"
import type { PresetConfig } from "../presets.js"
import { buildConfig } from "../utils/config-builder.js"
import { silenceConsole } from "../utils/silence.js"

export async function runExtractTemplateBenchmark(
  fixturesDir: string,
  preset: PresetConfig,
) {
  const { default: extractTemplateCommand } =
    await import("@lingui/cli/commands/extract-template")

  const babelConfig = buildConfig(fixturesDir, preset, false)
  const swcConfig = buildConfig(fixturesDir, preset, true)

  const bench = new Bench({ warmup: 1, iterations: 3 })

  bench.add("Babel · 1 worker", async () => {
    const restore = silenceConsole()
    try {
      await extractTemplateCommand(babelConfig, {
        verbose: false,
        workersOptions: { poolSize: 0 },
      })
    } finally {
      restore()
    }
  })

  bench.add("Babel · 2 workers", async () => {
    const restore = silenceConsole()
    try {
      await extractTemplateCommand(babelConfig, {
        verbose: false,
        workersOptions: { poolSize: 2 },
      })
    } finally {
      restore()
    }
  })

  bench.add("SWC · 1 worker", async () => {
    const restore = silenceConsole()
    try {
      await extractTemplateCommand(swcConfig, {
        verbose: false,
        workersOptions: { poolSize: 0 },
      })
    } finally {
      restore()
    }
  })

  bench.add("SWC · 2 workers", async () => {
    const restore = silenceConsole()
    try {
      await extractTemplateCommand(swcConfig, {
        verbose: false,
        workersOptions: { poolSize: 2 },
      })
    } finally {
      restore()
    }
  })

  await bench.run()
  return bench
}

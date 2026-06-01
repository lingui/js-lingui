import fs from "fs"
import path from "path"
import { Bench } from "tinybench"
import { transformAsync } from "@babel/core"
import linguiMacroPlugin from "@lingui/babel-plugin-lingui-macro"
import type { PresetConfig } from "../presets.js"
import { buildConfig } from "../utils/config-builder.js"
import { getBabelParserOptions } from "@lingui/cli/api/extractors/babel"

interface SourceFile {
  filename: string
  code: string
}

function loadSourceFiles(fixturesDir: string): SourceFile[] {
  const srcDir = path.join(fixturesDir, "src")
  const files: SourceFile[] = []

  for (const subdir of ["components", "utils"]) {
    const dir = path.join(srcDir, subdir)
    if (!fs.existsSync(dir)) continue
    for (const file of fs.readdirSync(dir)) {
      const filename = path.join(dir, file)
      files.push({ filename, code: fs.readFileSync(filename, "utf-8") })
    }
  }

  return files
}

export async function runMacroTransformBenchmark(
  fixturesDir: string,
  preset: PresetConfig,
) {
  const sourceFiles = loadSourceFiles(fixturesDir)
  const config = buildConfig(fixturesDir, preset, false)

  const bench = new Bench({ warmupIterations: 1, iterations: 3 })

  bench.add("Babel", async () => {
    for (const { filename, code } of sourceFiles) {
      await transformAsync(code, {
        filename,
        babelrc: false,
        configFile: false,
        code: false,
        plugins: [
          [
            linguiMacroPlugin,
            { descriptorFields: "all", linguiConfig: config },
          ],
        ],
        parserOpts: {
          plugins: getBabelParserOptions(filename, undefined),
        },
      })
    }
  })

  const swc = await import("@swc/core")

  bench.add("SWC", async () => {
    for (const { filename, code } of sourceFiles) {
      const isTsx = filename.endsWith(".tsx")
      await swc.transform(code, {
        filename,
        jsc: {
          parser: isTsx
            ? { syntax: "typescript", tsx: true }
            : { syntax: "typescript", tsx: false },
          experimental: {
            plugins: [
              [
                "@lingui/swc-plugin",
                { descriptorFields: "all" } as Record<string, unknown>,
              ],
            ],
          },
        },
      })
    }
  })

  await bench.run()
  return bench
}

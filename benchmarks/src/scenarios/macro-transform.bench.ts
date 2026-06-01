import fs from "fs"
import path from "path"
import { Bench } from "tinybench"
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
  const { transformAsync } = await import("@babel/core")
  const swc = await import("@swc/core")

  const sourceFiles = loadSourceFiles(fixturesDir)
  const config = buildConfig(fixturesDir, preset, false)

  async function compileBabel(
    code: string,
    filename: string,
    withMacro: boolean,
  ) {
    await transformAsync(code, {
      filename,
      babelrc: false,
      configFile: false,
      code: false,
      plugins: withMacro
        ? [
            [
              linguiMacroPlugin,
              { descriptorFields: "all", linguiConfig: config },
            ],
          ]
        : [],
      parserOpts: {
        plugins: getBabelParserOptions(filename, undefined),
      },
    })
  }

  async function compileSwc(
    code: string,
    filename: string,
    withMacro: boolean,
  ) {
    const isTsx = filename.endsWith(".tsx")
    await swc.transform(code, {
      filename,
      jsc: {
        target: "esnext",
        transform: {
          react: {
            runtime: "preserve",
          },
        },
        parser: isTsx
          ? { syntax: "typescript", tsx: true }
          : { syntax: "typescript", tsx: false },
        experimental: {
          plugins: withMacro
            ? [
                [
                  "@lingui/swc-plugin",
                  { descriptorFields: "all" } as Record<string, unknown>,
                ],
              ]
            : [],
        },
      },
    })
  }

  const bench = new Bench({ warmupIterations: 1, iterations: 3 })

  bench.add("Babel", async () => {
    await Promise.all(
      sourceFiles.map(async ({ filename, code }) =>
        compileBabel(code, filename, true),
      ),
    )
  })

  bench.add("Babel - no macro", async () => {
    await Promise.all(
      sourceFiles.map(async ({ filename, code }) =>
        compileBabel(code, filename, false),
      ),
    )
  })

  bench.add("SWC", async () => {
    await Promise.all(
      sourceFiles.map(async ({ filename, code }) =>
        compileSwc(code, filename, true),
      ),
    )
  })

  bench.add("SWC - no macro", async () => {
    await Promise.all(
      sourceFiles.map(async ({ filename, code }) =>
        compileSwc(code, filename, false),
      ),
    )
  })

  await bench.run()
  return bench
}
